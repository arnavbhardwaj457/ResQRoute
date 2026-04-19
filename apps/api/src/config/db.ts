import mongoose from 'mongoose';

export async function connectDb() {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  await mongoose.connect(mongodbUri);
}
