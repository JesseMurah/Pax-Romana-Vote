import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { EcConsensusService } from "../utils/ec-consensus.service";
export declare class EcConsensusGuard implements CanActivate {
    private reflector;
    private ecConsensusService;
    constructor(reflector: Reflector, ecConsensusService: EcConsensusService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
