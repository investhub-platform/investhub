import mongoose from 'mongoose';

const eventSchema = mongoose.Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The Mentor who created the event
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add an event title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description or agenda'],
    },
    eventType: {
      type: String,
      enum: ['Webinar', 'Workshop', 'Pitch Day', 'Networking', 'Legal Session'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    link: { // Zoom or Google Meet link
      type: String,
      required: [true, 'Please add the meeting link'],
    },
    bannerImage: {
      type: String, // URL to image (Cloudinary/S3)
      default: 'default_event.jpg'
    },
    attendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Investors/Startups who RSVP'd
    }]
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);