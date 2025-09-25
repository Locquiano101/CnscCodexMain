import { Post } from "../models/index.js";

export const getPostByOrgProfile = async (req, res) => {
  try {
    const { orgProfileId } = req.params;
    const posts = await Post.find({
      organizationProfile: orgProfileId,
    })
      .populate("organizationProfile")
      .populate("content");

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No post(s) found" });
    }

    res.status(200).json(posts);
  } catch (err) {
    console.error("getPostByOrgProfile error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

export const addDocumentsToPost = async (req, res) => {
  try {
    const { caption, tags, title, organization, organizationProfile } =
      req.body;

    if (!res.locals.documentIds || res.locals.documentIds.length === 0) {
      return res.status(400).json({ error: "No documents to attach" });
    }

    // Create a brand-new post
    const newPost = new Post({
      caption,
      organization,
      organizationProfile,
      tags,
      title,
      content: res.locals.documentIds, // add all documents
    });

    const savedPost = await newPost.save();

    return res.status(201).json({
      message: "Post created with documents",
      post: savedPost,
    });
  } catch (err) {
    console.error("addDocumentsToPost error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getPostForPublic = async (req, res) => {
  try {
    // Always get all posts
    let query = Post.find();

    // Populate references
    query = query.populate("organizationProfile").populate("content");

    const posts = await query.exec();

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No post(s) found" });
    }

    res.status(200).json(posts);
  } catch (err) {
    console.log("getPostForPublic error:", err);
    res.status(500).json({ error: err.message });
  }
};
