import mongoose, { Schema, Document } from "mongoose";

export interface IDefinition {
  number: number;
  meaning: string;
  verbType?: string;
  examples: string[];
}

export interface IRelatedWord {
  word: string;
  type: string;
  partOfSpeech: string;
  meaning: string;
}

export interface IGenderForms {
  feminine?: string;
  masculine?: string;
  epicene?: string;
}

export interface IPronunciation {
  stressNote?: string;
  ipa?: string;
}

export interface IVocabulary extends Document {
  word: string;
  partOfSpeech: string;
  verbType?: string;
  definitions: IDefinition[];
  relatedWords: IRelatedWord[];
  pronunciation: IPronunciation;
  compoundParts: string[];
  genderForms: IGenderForms;
  letter: string;
  createdAt: Date;
  updatedAt: Date;
}

const DefinitionSchema = new Schema<IDefinition>({
  number: { type: Number, required: true },
  meaning: { type: String, required: true },
  verbType: { type: String },
  examples: [{ type: String }],
});

const RelatedWordSchema = new Schema<IRelatedWord>({
  word: { type: String, required: true },
  type: { type: String, required: true },
  partOfSpeech: { type: String, required: true },
  meaning: { type: String, required: true },
});

const PronunciationSchema = new Schema<IPronunciation>({
  stressNote: { type: String },
  ipa: { type: String },
});

const GenderFormsSchema = new Schema<IGenderForms>({
  feminine: { type: String },
  masculine: { type: String },
  epicene: { type: String },
});

const VocabularySchema = new Schema<IVocabulary>(
  {
    word: { type: String, required: true, trim: true },
    partOfSpeech: { type: String, required: true },
    verbType: { type: String },
    definitions: [DefinitionSchema],
    relatedWords: [RelatedWordSchema],
    pronunciation: PronunciationSchema,
    compoundParts: [{ type: String }],
    genderForms: GenderFormsSchema,
    letter: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexes
VocabularySchema.index({ word: 1 }, { unique: true });
VocabularySchema.index({ letter: 1 });
VocabularySchema.index({ "definitions.meaning": "text" });
VocabularySchema.index({ word: "text" });

export default mongoose.models.Vocabulary || mongoose.model<IVocabulary>("Vocabulary", VocabularySchema);
