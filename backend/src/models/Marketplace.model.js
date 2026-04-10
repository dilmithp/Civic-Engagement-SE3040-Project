import mongoose from 'mongoose';

const marketplaceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters']
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters']
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true
        },
        type: {
            type: String,
            enum: ['donation', 'sale'],
            required: [true, 'Listing type is required']
        },
        price: {
            type: Number,
            required: function () {
                return this.type === 'sale';
            },
            min: [0, 'Price cannot be negative']
        },
        images: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            enum: ['available', 'reserved', 'sold', 'expired'],
            default: 'available'
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Owner is required']
        },
        contactInfo: {
            type: String,
            required: [true, 'Contact info is required'],
            trim: true
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    },
    {
        timestamps: true
    }
);

const Marketplace = mongoose.model('Marketplace', marketplaceSchema);

export default Marketplace;
