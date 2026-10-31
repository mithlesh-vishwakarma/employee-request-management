import * as employeeService from '../services/employee.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getEmployees = async (req, res, next) => {
  try {
    const result = await employeeService.getAllEmployees(req.query);
    return successResponse(
      res,
      200,
      'Employees retrieved successfully',
      result.employees,
      result.pagination
    );
  } catch (err) {
    next(err);
  }
};

export const getEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    return successResponse(res, 200, 'Employee retrieved successfully', employee);
  } catch (err) {
    next(err);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body, req.user);
    return successResponse(res, 201, 'Employee created successfully', employee);
  } catch (err) {
    next(err);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body, req.user);
    return successResponse(res, 200, 'Employee updated successfully', employee);
  } catch (err) {
    next(err);
  }
};

export const toggleStatus = async (req, res, next) => {
  try {
    const employee = await employeeService.toggleEmployeeStatus(req.params.id, req.user);
    return successResponse(
      res,
      200,
      `Employee status set to ${employee.isActive ? 'active' : 'inactive'}`,
      employee
    );
  } catch (err) {
    next(err);
  }
};
