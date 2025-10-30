import Booking from "../models/Booking.js";
import Car from "../models/Car.js";


// ✅ Function to check availability of a car for a given date range
const checkAvailability = async (car, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    car,
    $or: [
      { pickupDate: { $lte: returnDate }, returnDate: { $gte: pickupDate } },
    ],
  });
  return bookings.length === 0;
};


// ✅ API: Check availability of cars for a given date and location
export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;

    // Fetch all available cars for the given location
    const cars = await Car.find({ location, isAvailable: true });

    // Check each car’s availability in the date range
    const availableCarsPromises = cars.map(async (car) => {
      const isAvailable = await checkAvailability(car._id, pickupDate, returnDate);
      return { ...car._doc, isAvailable };
    });

    let availableCars = await Promise.all(availableCarsPromises);
    availableCars = availableCars.filter((car) => car.isAvailable);

    res.json({ success: true, availableCars });
  } catch (error) {
    console.error("Error checking availability:", error.message);
    res.json({ success: false, message: error.message });
  }
};


// ✅ API: Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    let { car, pickupDate, returnDate } = req.body;

    // Ensure car is a valid ObjectId string
    if (typeof car === "object" && car._id) {
      car = car._id;
    }

    const carData = await Car.findById(car);
    if (!carData) {
      return res.json({ success: false, message: "Car not found" });
    }

    const isAvailable = await checkAvailability(car, pickupDate, returnDate);
    if (!isAvailable) {
      return res.json({ success: false, message: "Car is not available for selected dates" });
    }

    // Calculate price based on pickupDate and returnDate
    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
    const price = carData.pricePerDay * noOfDays;

    await Booking.create({
      car: carData._id,
      owner: carData.owner,
      user: _id,
      pickupDate,
      returnDate,
      price,
      status: "pending", // Default booking status
    });

    res.json({ success: true, message: "Booking Created" });
  } catch (error) {
    console.error("Error creating booking:", error.message);
    res.json({ success: false, message: error.message });
  }
};


// ✅ API: List all user bookings
export const getUserBookings = async (req, res) => {
  try {
    const { _id } = req.user;
    const bookings = await Booking.find({ user: _id })
      .populate("car")
      .sort({ createdAt: -1 });

    // Filter out bookings where car is null (car deleted)
    const validBookings = bookings.filter((b) => b.car !== null);

    res.json({ success: true, bookings: validBookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error.message);
    res.json({ success: false, message: error.message });
  }
};


// ✅ API: Get all bookings for a car owner
export const getOwnerBookings = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const bookings = await Booking.find({ owner: req.user._id })
      .populate("car user")
      .select("-user.password")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching owner bookings:", error.message);
    res.json({ success: false, message: error.message });
  }
};


// ✅ API: Change booking status
export const changeBookingStatus = async (req, res) => {
  try {
    const { _id } = req.user;
    const { bookingId, status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    if (booking.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error("Error changing booking status:", error.message);
    res.json({ success: false, message: error.message });
  }
};
