"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowInstanceController = void 0;
const common_1 = require("@nestjs/common");
const workflow_instance_service_1 = require("./workflow-instance.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let WorkflowInstanceController = class WorkflowInstanceController {
    service;
    constructor(service) {
        this.service = service;
    }
    start(req, data) {
        return this.service.instantiate(data.templateId, req.user.id, data.parameters);
    }
    findAll(req) {
        return this.service.findAll(req.user.role === 'WORKER' ? req.user.id : undefined);
    }
    getMyTasks(req) {
        return this.service.getMyTasks(req.user.id);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    claim(req, id) {
        return this.service.claimTask(id, req.user.id);
    }
    unassign(req, id) {
        return this.service.unassignTask(id, req.user.id);
    }
    complete(req, id, body) {
        return this.service.completeStep(id, req.user.id, body.responses);
    }
};
exports.WorkflowInstanceController = WorkflowInstanceController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WorkflowInstanceController.prototype, "start", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkflowInstanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tasks/my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkflowInstanceController.prototype, "getMyTasks", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkflowInstanceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('tasks/:id/claim'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkflowInstanceController.prototype, "claim", null);
__decorate([
    (0, common_1.Patch)('tasks/:id/unassign'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkflowInstanceController.prototype, "unassign", null);
__decorate([
    (0, common_1.Post)('tasks/:id/complete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], WorkflowInstanceController.prototype, "complete", null);
exports.WorkflowInstanceController = WorkflowInstanceController = __decorate([
    (0, common_1.Controller)('workflow-instances'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [workflow_instance_service_1.WorkflowInstanceService])
], WorkflowInstanceController);
//# sourceMappingURL=workflow-instance.controller.js.map