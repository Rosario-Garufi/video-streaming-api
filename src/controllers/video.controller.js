const mongoose = require('mongoose');
const Video = require('../models/video.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require('../utils/cloudinary');
const User = require('../models/user.model');
//@Desc : upload and publish a new video
//@route POST /api/v1/videos
//Private

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description, category, tags } = req.body;
  if (!title || !description || !category) {
    throw new ApiError(400, 'Title, description, category are required');
  }

  //check is files are uploaded
  if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
    throw new ApiError(400, 'Video file, thumbnail are required');
  }

  //get file path
  const videoLocalPath = req?.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req?.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, 'video and thumbnail are required');
  }

  //upload to cloudinary
  const videoUpload = await uploadToCloudinary(
    videoLocalPath,
    'youtube/videos'
  );
  if (!videoUpload) {
    throw new ApiError(500, 'Error uploading video');
  }

  //upload thumbnail
  const thumbnailUpload = await uploadToCloudinary(
    thumbnailLocalPath,
    'youtube/thumbnails'
  );

  if (!thumbnailUpload) {
    await deleteFromCloudinary(videoUpload?.public_id, 'youtube/videos');
    throw new ApiError(500, 'Error thumbnail upload failed');
  }

  //create video document
  const video = await Video.create({
    title,
    description,
    videoFile: {
      public_id: videoUpload?.public_id,
      url: videoUpload?.secure_url,
    },
    thumbnail: {
      public_id: thumbnailUpload?.public_id,
      url: thumbnailUpload?.secure_url,
    },
    duration: videoUpload?.duration || 0,
    owner: req.user._id,
    category,
    tags: tags ? JSON.parse(tags) : [],
  });

  if (video) {
    //return response
    return res
      .status(201)
      .json(new ApiResponse(201, video, 'Video upload successful'));
  } else {
    await Promise.all([
      deleteFromCloudinary(videoUpload.public_id, 'youtube/videos'),
      deleteFromCloudinary(thumbnailUpload.public_id, 'youtube/thumbnails'),
    ]);
    throw new ApiError(500, 'Create video failed');
  }
});

//@Desc : Get all videos with filtering, sorting and pagination
//@route GET /api/v1/videos?page=1&limit=10$query=tutorials&sortedBy=views&sortType=desc&userId=1234
//Public

const getAllVideos = asyncHandler(async (req, res) => {
  //mongodb aggregation framework
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  //inizialize empty pipeline array for mongoDB aggregation stages
  let pipeline = [];
  //stage 1: filter by userID ( id provided )
  if (userId) {
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  //STAGE 2: Text search ( if query provided )
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
      },
    });
  }

  //STAGE 3: published Videos filter
  // pipeline.push({
  //   $match: { isPublished: true },
  // });

  //STAGE 4: User data Lookup
  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    //STAGE 5: Convert Owner Array to single Object
    {
      $addFields: {
        owner: {
          $first: '$owner',
        },
      },
    }
  );

  //STAGE 6: Sorting
  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === 'asc' ? 1 : -1,
      },
    });
  } else {
    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });
  }

  //calculating total number of matching video for pagination
  const totalResult = await Video.countDocuments(
    pipeline.length > 0 ? pipeline[0].$match : {}
  );

  //STAGE 7: Pagination
  pipeline.push(
    {
      $skip: (Number(page) - 1) * Number(limit),
    },
    {
      $limit: Number(limit),
    }
  );

  //excute the complete aggregation pipeline
  const videos = await Video.aggregate(pipeline);

  //return paginated with metadata
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        totalResult,
        currentPage: parseInt(page),
        totalResult,
        totalPaged: Math.ceil(totalResult / Number(limit)),
      },
      'Videos fetched successfully'
    )
  );
});

//@Desc : Get video details
//@route GET /api/v1/videos/:videoId
//Public

const getVideoDetails = asyncHandler(async (req, res) => {
  console.log('Video rotta');
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, 'Video id is required');
  }

  //find the video and update video view count
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: { views: 1 },
    },
    { new: true }
  ).populate('owner', 'username fullName avatar');

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  //add the video on the cronology watch history
  if (req.user) {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          watchHistory: videoId,
        },
      },
      { new: true }
    );
  }

  ///send the response
  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video fetched successful'));
});

//@Desc : update video thumbnail
//@route PATCH /api/v1/videos/:videoId
//Private

const updateVideoThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, category, tags, isPublished } = req.body;

  if (!videoId) {
    throw new ApiError(400, 'Video id is required');
  }

  //check if exist the video abd velong to user

  const video = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  });
  if (!video) {
    throw new ApiError(400, 'Video not found');
  }

  //update thumbnail if uploaded
  let thumbnailUpdate = {};
  if (req.file) {
    const thumbnailLocalPath = req.file.path;
    if (thumbnailLocalPath) {
      //delete the old thumbnail
      if (video?.thumbnail?.public_id) {
        console.log(`Ecco l'id del thumbnail -> ${video?.thumbnail}`);
        await deleteFromCloudinary(video?.thumbnail?.public_id);
      }
      //upload new thumbnail
      const thumbnailUpload = await uploadToCloudinary(
        thumbnailLocalPath,
        'youtube/thumbnails'
      );
      if (!thumbnailUpload) {
        throw new ApiError(500, 'Error upload thumbail to cloudinary');
      }
      thumbnailUpdate = {
        thumbnail: {
          public_id: thumbnailUpload?.public_id,
          url: thumbnailUpload?.secure_url,
        },
      };
    }
  }

  //update video details
  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title || video.title,
        description: description || video.description,
        category: category || video.category,
        isPublished:
          isPublished !== undefined ? isPublished : video?.isPublished,
        tags: tags ? JSON.parse(tags) : video?.tags,
        ...thumbnailUpdate,
      },
    },
    { new: true }
  ).populate('owner', 'username fullName avatar');

  //return the response
  res
    .status(200)
    .json(new ApiResponse(200, updateVideo, 'Video update successfull'));
});

//@Desc : delete video
//@route DELETE /api/v1/videos/:videoId
//Private

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(404, 'Video not found');
  }

  //check if the video exist
  const video = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(400, "Video not found or you don't have permission");
  }

  //delete video from cloudinary
  if (video?.videoFile?.public_id) {
    await deleteFromCloudinary(video?.videoFile?.public_id);
  }

  //delete thumbnail from cloudinary
  if (video?.thumbnail?.public_id) {
    await deleteFromCloudinary(video?.thumbnail?.public_id);
  }

  //delete video from database
  await Video.findByIdAndDelete(videoId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Video deleted successfully'));
});

//@Desc :  toggle video publish status (publish/unpublish)
//@route GET /api/v1/videos/:videoId
//Private

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, 'Video id is required');
  }

  //check if the video exist
  const video = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(404, 'Video not found or you not have permission');
  }

  //toggle publish status
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    { new: true }
  ).populate('owner', 'username fullName avatar');

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        `Video ${updatedVideo.isPublished ? 'published' : 'unpublished'} successfully`
      )
    );
});

//!@Desc :  generate sharing links for a video
//@route GET /api/v1/videos/:videoId
//Private

const shareVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { platform = 'general' } = req.query;
  if (!videoId) {
    throw new ApiError(400, 'Video id is required');
  }

  //get video detail
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video not found or you not have permission');
  }

  //generate share link
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const videoUrl = `${baseUrl}/api/v1/videos/${videoId}`;

  //generate playform specific links
  const shareLinks = {
    direct: videoUrl,
    clipboard: videoUrl,
  };

  //add platform-specific share links
  switch (platform.toLowerCase()) {
    case 'facebook':
      shareLinks.facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`;
      break;

    case 'twitter':
      shareLinks.twitter = `https://www.twitter.com/intent/tweet/url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(video.title)}`;
      break;

    case 'whatsap':
      shareLinks.whatsap = `https://api.whatsap.com/send?text=${encodeURIComponent(video.title + ' ' + videoUrl)}`;
      break;

    case 'linkedin':
      shareLinks.linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl)}`;
      break;

    case 'telegram':
      shareLinks.linkedin = `https://t.me/share/url?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(video.title)}`;
      break;
    case 'reddit':
      shareLinks.linkedin = `https://reddit.com/submit?url=${encodeURIComponent(video.title)}&text=${encodeURIComponent(video.title)}`;
      break;
    default:
      //for "general, include all share links"
      shareLinks = {
        ...shareLinks,
        facebook: `https://www.facebook.com/sharer/sharer.php/u=${encodeURIComponent(videoUrl)}`,
        twitter: `https://www.twitter.com/intent/tweet/url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(video.title)}`,
        whatsap: `https://api.whatsap.com/send?text=${encodeURIComponent(video.title + ' ' + videoUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(video.title)}`,
        reddit: `https://reddit.com/submit?url=${encodeURIComponent(video.title)}&text=${encodeURIComponent(video.title)}`,
      };
  }

  //increment the share count (optional)
  await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: { shares: 1 },
    },
    { new: true }
  );

  //send response
  res.status(200).json(
    new ApiResponse(
      200,
      {
        videoId,
        videoTitle: video.title,
        thumbnail: video.thumbnail,
        shareLinks,
      },
      'Video share links generated'
    )
  );
});

module.exports = {
  publishVideo,
  getAllVideos,
  getVideoDetails,
  updateVideoThumbnail,
  deleteVideo,
  togglePublishStatus,
  shareVideo,
};
