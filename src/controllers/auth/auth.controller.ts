import { Logger } from "winston";
import { Response } from "express";
import { ApiError, ApiResponse } from "../../utils";
import { CustomRequest } from "../../types/shared.types";
import { HashService, TokenService, UserService } from "../../services";
import {
  IUser,
  ILoginRequestBody,
  IVerifyRequestBody,
  UserType,
} from "../../types/user.types";
import { ITenant } from "../../types/tenant.types";

export class AuthController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private hashService: HashService,
    private logger: Logger,
  ) {}

  private _buildUserResponse(user: UserType, token: string) {
    const tenant = user.tenantId as unknown as ITenant;
    return {
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        tenant: {
          tenantId: tenant?._id,
          name: tenant?.name,
          websiteUrl: tenant?.websiteUrl,
          domain: tenant?.domain,
        },
      },
      token,
    };
  }

  async register(req: CustomRequest<UserType>, res: Response) {
    const { email, _id: adminUserId } = req.user as IUser;
    const userData = req.body;

    this.logger.info({
      msg: "Registration attempt",
      data: { email: userData.email, fullName: userData.fullName },
      adminEmail: email,
      adminUserId,
    });

    const userExists = await this.userService.exists({ email: userData.email });
    if (userExists) {
      throw new ApiError(409, "Email address is already registered.");
    }

    const hashedPassword = await this.hashService.hashData(userData.password);
    const createdUser = await this.userService.create({
      ...userData,
      password: hashedPassword,
      isVerified: false,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { userId: createdUser._id },
          "Registration successful. Awaiting admin approval.",
        ),
      );
  }

  async login(req: CustomRequest<ILoginRequestBody>, res: Response) {
    const { email, password } = req.body;

    this.logger.info({ msg: "Login attempt", data: { email } });

    const user = await this.userService.getOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found.");
    }
    if (!user.isVerified) {
      throw new ApiError(404, "User not verified by admin");
    }

    const isPasswordValid = await this.hashService.hashCompare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ApiError(400, "Invalid credentials.");
    }

    const accessToken = await this.tokenService.signToken({
      user: { _id: user._id },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          this._buildUserResponse(user, accessToken),
          "Login successful.",
        ),
      );
  }

  async verify(req: CustomRequest<IVerifyRequestBody>, res: Response) {
    const { token } = req.body;

    this.logger.info({ msg: "Verification attempt", data: { token } });

    const decodedToken = this.tokenService.verifyToken(token);
    if (!decodedToken) {
      throw new ApiError(400, "Invalid or expired token.");
    }

    const user = await this.userService.getById(decodedToken.user._id);
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    await this.userService.updateById(decodedToken.user._id, {
      isVerified: true,
    });

    const accessToken = await this.tokenService.signToken({
      user: { _id: user._id },
      exp: "10d",
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          this._buildUserResponse(user, accessToken),
          "Verification successful.",
        ),
      );
  }

  async create(req: CustomRequest<UserType>, res: Response) {
    const { email, _id: adminUserId } = req.user as IUser;
    const userData = req.body;

    this.logger.info({
      msg: "User creation attempt",
      data: userData,
      adminEmail: email,
      adminUserId,
    });

    const userExists = await this.userService.exists({ email: userData.email });
    if (userExists) {
      throw new ApiError(
        400,
        `Email address already registered: ${userData.email}`,
      );
    }

    const hashedPassword = await this.hashService.hashData(userData.password);
    const createdUser = await this.userService.create({
      ...userData,
      password: hashedPassword,
      isVerified: true,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User created successfully."));
  }
}
