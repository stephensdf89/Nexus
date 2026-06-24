const postingHelper = {
  youtube: {
    uploadUrl: "https://www.youtube.com/upload",
    fields: ["youtube_title", "youtube_description", "youtube_tags"],
    copy: (platformFields) => ({
      title: platformFields.youtube_title || "",
      description: platformFields.youtube_description || "",
      tags: platformFields.youtube_tags || ""
    }),
    limits: {
      title: 100,
      description: 5000,
      tags: 500
    }
  },

  tiktok: {
    uploadUrl: "https://www.tiktok.com/upload",
    fields: ["tiktok_caption", "tiktok_hashtags"],
    copy: (platformFields) => ({
      caption: platformFields.tiktok_caption || "",
      hashtags: platformFields.tiktok_hashtags || ""
    }),
    limits: {
      caption: 2200
    }
  },

  instagram: {
    uploadUrl: "https://business.facebook.com/creatorstudio",
    fields: ["instagram_caption", "instagram_hashtags", "instagram_alt_text"],
    copy: (platformFields) => ({
      caption: platformFields.instagram_caption || "",
      hashtags: platformFields.instagram_hashtags || "",
      alt_text: platformFields.instagram_alt_text || ""
    }),
    limits: {
      caption: 2200
    }
  },

  shorts: {
    uploadUrl: "https://www.youtube.com/upload",
    fields: ["shorts_caption", "shorts_hashtags"],
    copy: (platformFields) => ({
      caption: platformFields.shorts_caption || "",
      hashtags: platformFields.shorts_hashtags || ""
    }),
    limits: {
      caption: 100
    }
  },

  x: {
    uploadUrl: "https://x.com/compose/post",
    fields: ["x_text", "x_thread"],
    copy: (platformFields) => ({
      text: platformFields.x_text || "",
      thread: platformFields.x_thread || ""
    }),
    limits: {
      text: 280
    }
  },

  linkedin: {
    uploadUrl: "https://www.linkedin.com/feed/",
    fields: ["linkedin_text", "linkedin_tags"],
    copy: (platformFields) => ({
      text: platformFields.linkedin_text || "",
      tags: platformFields.linkedin_tags || ""
    }),
    limits: {
      text: 3000
    }
  },

  pinterest: {
    uploadUrl: "https://www.pinterest.com/pin-builder/",
    fields: ["pinterest_title", "pinterest_description"],
    copy: (platformFields) => ({
      title: platformFields.pinterest_title || "",
      description: platformFields.pinterest_description || ""
    }),
    limits: {
      title: 100,
      description: 500
    }
  },

  facebook: {
    uploadUrl: "https://business.facebook.com/creatorstudio",
    fields: ["facebook_caption"],
    copy: (platformFields) => ({
      caption: platformFields.facebook_caption || ""
    }),
    limits: {
      caption: 63206
    }
  }
};

export default postingHelper;
