export const validateRequestForm = (values) => {
  const errors = {};
  if (!values.title?.trim()) {
    errors.title = 'Title is required';
  } else if (values.title.length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }

  if (!values.description?.trim()) {
    errors.description = 'Description is required';
  } else if (values.description.length < 15) {
    errors.description = 'Please provide at least 15 characters of detail';
  }

  return errors;
};
