// Message model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RoomMessageSchema = new Schema({
    room_name: String,
    from_Id: String,
    to_Id: String,
    text: String,
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('RoomMessage', RoomMessageSchema);

