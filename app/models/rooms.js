// Room model

var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

var RoomSchema = new Schema({
    creator: {
      type: String,
      required: 'should need a creator'
    },
    room_name: {
        type: String,
        index: {unique: true},
        required: 'please fill a valid room name'
    },
    room_type: {
        type: String,
        enum: ['meeting', 'lesson', 'couple', 'free'],
        required: 'please fill a valid type of room'
    },
    protected: {
        type: Boolean,
        default: false
    },
    password: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    last_active: {
        type: Date
    },
    users: [
        {
            Id: String,
            role: {
                type: String,
                enum: ['creator', 'owner', 'member']
            },
            email: {
                type: String,
                lowercase: true,
                trim: true
            },
            sex: {
                type: String,
                default: '',
                enum: ['', 'male', 'female']
            },
            avatar: {
                type: String
            },
            address: {
                type: String
            },
            connected: {
              type: Boolean,
              default: false
            }
        }
    ]
});

/**
 * Hook a pre save method to hash the password
 */
RoomSchema.pre('save', function (next) {
    next();
});

mongoose.model('Room', RoomSchema);

