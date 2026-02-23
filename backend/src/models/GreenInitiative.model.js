import mongoose from 'mongoose';

const greenInitiativeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide an initiative title'],
            trim: true,
            maxLength: [100, 'Title cannot be more than 100 characters']
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
            maxLength: [1000, 'Description cannot be more than 1000 characters']
        },
        location: {
            type: String,
            required: [true, 'Please provide a location']
        },
        date: {
            type: Date,
            required: [true, 'Please provide a date for the initiative']
        },
        status: {
            type: String,
            enum: ['Upcoming', 'Ongoing', 'Completed'],
            default: 'Upcoming'
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        timestamps: true
    }
);

const GreenInitiative = mongoose.model('GreenInitiative', greenInitiativeSchema);
export default GreenInitiative;