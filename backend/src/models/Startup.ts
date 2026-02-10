import mongoose, { Schema, Document } from 'mongoose';

export interface IStartup extends Document {
  name: string;
  description?: string;
  createdAt: Date;
}

const StartupSchema = new Schema<IStartup>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export default mongoose.model<IStartup>('Startup', StartupSchema);
