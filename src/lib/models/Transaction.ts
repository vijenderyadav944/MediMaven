import mongoose, { Schema, Model } from "mongoose";

export interface ITransaction {
  _id: string;
  userId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  provider: "square";
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    provider: { type: String, default: "square" },
  },
  { timestamps: true }
);

export const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
