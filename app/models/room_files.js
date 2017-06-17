// Share Files model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RoomFileSchema = new Schema({
    room_id: String,
    title: String,
    url: String,
    file_name: String,
    share_type: {
        type: String,
        enum: ['pdf', 'image', 'media', 'other']
    },
    uploader: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('RoomFile', RoomFileSchema);

