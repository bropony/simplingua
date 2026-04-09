import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User";
import Discussion from "../src/models/Discussion";
import Comment from "../src/models/Comment";
import { hashPassword } from "../src/lib/auth";

// Load env
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/simplingua";

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Discussion.deleteMany({}),
    Comment.deleteMany({}),
  ]);

  // Create admin user
  const adminPasswordHash = await hashPassword("admin123");
  const admin = await User.create({
    username: "admin",
    email: "admin@simplingua.local",
    passwordHash: adminPasswordHash,
    displayName: "管理员",
    role: "admin",
  });
  console.log("Created admin user:", admin.username);

  // Create test user
  const userPasswordHash = await hashPassword("user123");
  const testUser = await User.create({
    username: "testuser",
    email: "test@simplingua.local",
    passwordHash: userPasswordHash,
    displayName: "测试用户",
    role: "user",
  });
  console.log("Created test user:", testUser.username);

  // Create sample discussions
  const discussion1 = await Discussion.create({
    title: "欢迎来到简语学习平台",
    content: "大家好！欢迎来到简语（Simplingua）学习与讨论平台。在这里你可以学习简语的词汇和语法，也可以和其他爱好者一起讨论。",
    authorId: admin._id,
    tags: ["公告", "欢迎"],
    isPinned: true,
  });

  const discussion2 = await Discussion.create({
    title: "简语动词变位讨论",
    content: "想和大家讨论一下简语中动词的变位规则。有没有人觉得某些不规则变位比较难记？",
    authorId: testUser._id,
    tags: ["语法", "动词"],
  });

  console.log("Created sample discussions");

  // Create sample comment
  await Comment.create({
    discussionId: discussion2._id,
    content: "我觉得多练习就好了，不规则变位其实不多。",
    authorId: admin._id,
  });

  console.log("Created sample comment");
  console.log("\nSeed complete!");
  console.log("Admin: admin / admin123");
  console.log("User:  testuser / user123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
