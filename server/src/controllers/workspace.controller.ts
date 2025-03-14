import { getMemberRoleInWorkspaceService } from "../services/member.service";
import { HttpStatus } from "../constants/httpStatus";
import { Messages } from "../constants/message";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  createWorkspaceService,
  getAllWorkspaceUserIsMemberOfService,
  getMembersByWorkspaceIdService,
  getWorkspaceByIdService,
  getWorkspaceAnalyticsService,
  changeMemberRoleInWorkspaceService,
  updateWorkspaceByIdService,
  deleteWorkspaceByIdService
} from "../services/workspace.service";
import {
  changeRoleSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdSchema
} from "../validations/workspace.validation";
import { roleGuard } from "../utils/roleGuard";
import { Permissions } from "../constants/enum";

export const createWorkspaceController = asyncHandler(async (req, res) => {
  const body = createWorkspaceSchema.parse(req.body);
  const userId = req.user?._id;

  const workspace = await createWorkspaceService(userId, body);

  return res.status(HttpStatus.CREATED).json({
    message: Messages.CREATED,
    workspace
  });
});

export const getAllWorkspaceUserIsMemberOfController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { workspaces } = await getAllWorkspaceUserIsMemberOfService(userId);

  return res.status(HttpStatus.OK).json({
    message: Messages.SUCCESS,
    workspaces
  });
});

export const getWorkspaceByIdController = asyncHandler(async (req, res) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id);
  const userId = req.user?._id;

  await getMemberRoleInWorkspaceService(userId, workspaceId);

  const { workspace } = await getWorkspaceByIdService(workspaceId);

  return res.status(HttpStatus.OK).json({
    message: Messages.SUCCESS,
    workspace
  });
});

export const getMembersByWorkspaceIdController = asyncHandler(async (req, res) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id);
  const userId = req.user?._id;

  const { role } = await getMemberRoleInWorkspaceService(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);

  const { members, roles } = await getMembersByWorkspaceIdService(workspaceId);

  return res.status(HttpStatus.OK).json({
    message: Messages.SUCCESS,
    members,
    roles
  });
});

export const getWorkspaceAnalyticsController = asyncHandler(async (req, res) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id);
  const userId = req.user?._id;
  const { role } = await getMemberRoleInWorkspaceService(userId, workspaceId);

  roleGuard(role, [Permissions.VIEW_ONLY]);
  const { analytics } = await getWorkspaceAnalyticsService(workspaceId);

  return res.status(HttpStatus.OK).json({
    message: Messages.SUCCESS,
    analytics
  });
});

export const changeMemberRoleInWorkspaceController = asyncHandler(async (req, res) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id);
  const userId = req.user?._id;
  const { memberId, roleId } = changeRoleSchema.parse(req.body);

  const { member } = await changeMemberRoleInWorkspaceService(workspaceId, memberId, roleId);

  return res.status(HttpStatus.OK).json({
    message: Messages.UPDATED,
    member
  });
});

export const updateWorkspaceByIdController = asyncHandler(async (req, res) => {
  const { name, description } = updateWorkspaceSchema.parse(req.body);
  const workspaceId = workspaceIdSchema.parse(req.params.id);
  const userId = req.user?._id;

  const { role } = await getMemberRoleInWorkspaceService(userId, workspaceId);
  roleGuard(role, [Permissions.UPDATE_WORKSPACE]);

  const { workspace } = await updateWorkspaceByIdService(workspaceId, name, description);

  return res.status(HttpStatus.OK).json({
    message: Messages.UPDATED,
    workspace
  });
});

export const deleteWorkspaceByIdController = asyncHandler(async (req, res) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id);
  const userId = req.user?._id;

  const { role } = await getMemberRoleInWorkspaceService(userId, workspaceId);
  roleGuard(role, [Permissions.DELETE_WORKSPACE]);

  const { currentWorkspace } = await deleteWorkspaceByIdService(workspaceId, userId);

  return res.status(HttpStatus.OK).json({
    message: Messages.DELETED,
    currentWorkspace
  });
});
