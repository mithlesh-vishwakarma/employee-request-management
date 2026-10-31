import mongoose from 'mongoose';

const requestCommentSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: [true, 'Request ID is required'],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [1, 'Message cannot be empty'],
    },
  },
  {
    timestamps: true,
  }
);

requestCommentSchema.index({ requestId: 1, createdAt: 1 });

export const RequestComment = mongoose.model('RequestComment', requestCommentSchema);
export default RequestComment;

