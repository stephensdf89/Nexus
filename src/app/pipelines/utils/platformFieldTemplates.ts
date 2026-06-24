const platformFieldTemplates: Record<string, Record<string, string>> = {
  youtube: {
    youtube_title: "",
    youtube_description: "",
    youtube_tags: "",
    youtube_keywords: "",
    youtube_thumbnail_notes: ""
  },

  tiktok: {
    tiktok_caption: "",
    tiktok_hashtags: "",
    tiktok_sound_notes: ""
  },

  instagram: {
    instagram_caption: "",
    instagram_hashtags: "",
    instagram_alt_text: ""
  },

  shorts: {
    shorts_caption: "",
    shorts_hashtags: ""
  },

  x: {
    x_text: "",
    x_thread: "" // could be expanded to array later
  },

  linkedin: {
    linkedin_text: "",
    linkedin_tags: ""
  },

  pinterest: {
    pinterest_title: "",
    pinterest_description: ""
  },

  facebook: {
    facebook_caption: ""
  }
};

export default platformFieldTemplates;
