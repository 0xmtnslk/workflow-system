import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, response: Response): Promise<any>;
    logout(response: Response): Promise<{
        message: string;
    }>;
    getProfile(req: any): any;
}
