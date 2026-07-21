import { Schema, model } from "mongoose";

interface Counter {
  _id: string;
  sequence: number;
}

const counterSchema = new Schema<Counter>(
  {
    _id: { type: String, required: true },
    sequence: { type: Number, required: true, default: 0 },
  },
  { versionKey: false },
);

const CounterModel = model<Counter>("Counter", counterSchema);

/** Atomically increments and returns the next value of a named sequence. */
export const getNextSequence = async (name: string): Promise<number> => {
  const counter = await CounterModel.findByIdAndUpdate(
    name,
    { $inc: { sequence: 1 } },
    { new: true, upsert: true },
  );

  return counter.sequence;
};
