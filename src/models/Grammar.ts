import mongoose, { Schema, Document, Types } from "mongoose";

export interface IExample {
  simplingua: string;
  chinese: string;
  notes?: string;
}

export interface ISubsection {
  title: string;
  content: string;
  examples: IExample[];
}

export interface ISection {
  title: string;
  content: string;
  examples: IExample[];
  subsections: ISubsection[];
}

export interface IGrammar extends Document {
  chapterTitle: string;
  chapterTitleSimp?: string;
  order: number;
  sections: ISection[];
  createdAt: Date;
  updatedAt: Date;
}

const ExampleSchema = new Schema<IExample>({
  simplingua: { type: String, required: true },
  chinese: { type: String, required: true },
  notes: { type: String },
});

const SubsectionSchema = new Schema<ISubsection>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  examples: [ExampleSchema],
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  examples: [ExampleSchema],
  subsections: [SubsectionSchema],
});

const GrammarSchema = new Schema<IGrammar>(
  {
    chapterTitle: { type: String, required: true },
    chapterTitleSimp: { type: String },
    order: { type: Number, required: true },
    sections: [SectionSchema],
  },
  { timestamps: true }
);

// Indexes
GrammarSchema.index({ order: 1 });
GrammarSchema.index({ chapterTitle: "text", "sections.content": "text" });

export default mongoose.models.Grammar || mongoose.model<IGrammar>("Grammar", GrammarSchema);
