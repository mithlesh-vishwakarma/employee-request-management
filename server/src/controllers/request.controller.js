import * as requestService from '../services/request.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const createRequest = async (req, res, next) => {
  try {
    const request = await requestService.createRequest(req.body, req.user);
    return successResponse(res, 201, 'Request submitted successfully', request);
  } catch (err) {
    next(err);
  }
};

export const getAllRequests = async (req, res, next) => {
  try {
    const result = await requestService.getAllRequests(req.query);
    return successResponse(
      res,
      200,
      'All organization requests retrieved successfully',
      result.requests,
      result.pagination
    );
  } catch (err) {
    next(err);
  }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const result = await requestService.getMyRequests(req.user._id, req.query);
    return successResponse(
      res,
      200,
      'Your requests retrieved successfully',
      result.requests,
      result.pagination
    );
  } catch (err) {
    next(err);
  }
};

export const getTeamRequests = async (req, res, next) => {
  try {
    const result = await requestService.getTeamRequests(req.user._id, req.query);
    return successResponse(
      res,
      200,
      'Team requests retrieved successfully',
      result.requests,
      result.pagination
    );
  } catch (err) {
    next(err);
  }
};

export const getRequestById = async (req, res, next) => {
  try {
    const request = await requestService.getRequestById(req.params.id, req.user);
    return successResponse(res, 200, 'Request details retrieved successfully', request);
  } catch (err) {
    next(err);
  }
};

export const approveRequest = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const request = await requestService.approveRequest(req.params.id, req.user, comment);
    return successResponse(res, 200, 'Request approved successfully', request);
  } catch (err) {
    next(err);
  }
};

export const rejectRequest = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const request = await requestService.rejectRequest(req.params.id, req.user, comment);
    return successResponse(res, 200, 'Request rejected with comments', request);
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { message } = req.body;
    const comment = await requestService.addRequestComment(req.params.id, req.user, message);
    return successResponse(res, 201, 'Comment added successfully', comment);
  } catch (err) {
    next(err);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const comments = await requestService.getRequestComments(req.params.id, req.user);
    return successResponse(res, 200, 'Comments retrieved successfully', comments);
  } catch (err) {
    next(err);
  }
};
