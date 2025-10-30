import { motion } from 'motion/react';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import { useAppContext } from "../context/AppContext";

const MyBookings = () => {
  const { axios, user, currency } = useAppContext();
  const [bookings, setBookings] = useState([]);

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/user");
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) fetchMyBookings();
  }, [user]);

  return (
    <motion.div
    initial={{ opacity: 0, y: 30}}
    animate={{ opacity: 1, y: 0}}
    transition={{ duration: 0.6}}

      className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl"
    >
      <Title
        title="My Bookings"
        subTitle="View and manage all your car bookings"
        align="left"
      />

      <div>
        {bookings.length === 0 && (
          <p className="mt-12 text-gray-500">No bookings found.</p>
        )}

        {bookings.map((booking, index) => {
          const car = booking.car;

          // 🔒 Prevent crash if car is missing
          if (!car) {
            return (
              <div
                key={booking._id}
                className="p-6 border border-borderColor rounded-lg mt-5 first:mt-12 bg-red-50"
              >
                <p className="text-red-600 font-medium">
                  ⚠️ Car details unavailable for this booking.
                </p>
                <p className="text-gray-600 mt-1">
                  Booking ID: {booking._id} <br />
                  Booked on: {booking.createdAt.split("T")[0]}
                </p>
              </div>
            );
          }

          return (
            <motion.div
            initial={{ opacity: 0, y: 20}}
            animate={{ opacity: 1, y: 0}}
            transition={{ duration: 0.4, delay: index * 0.1}}
              key={booking._id}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12"
            >
              {/* Car Info */}
              <div className="md:col-span-1">
                <div className="rounded-md overflow-hidden mb-3">
                  <img
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-auto aspect-video object-cover"
                  />
                </div>
                <p className="text-lg font-medium mt-2">
                  {car.brand} {car.model}
                </p>
                <p className="text-gray-500">
                  {car.year} • {car.category} • {car.location}
                </p>
              </div>

              {/* Booking Info */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <p className="px-3 py-1.5 bg-light rounded">
                    Booking #{index + 1}
                  </p>
                  <p
                    className={`px-3 py-1 text-xs rounded-full ${
                      booking.status === "confirmed"
                        ? "bg-green-400/15 text-green-600"
                        : "bg-red-400/15 text-red-600"
                    }`}
                  >
                    {booking.status}
                  </p>
                </div>

                <div className="flex items-start gap-2 mt-3">
                  <img
                    src={assets.calendar_icon_colored}
                    alt=""
                    className="w-4 h-4 mt-1"
                  />
                  <div>
                    <p className="text-gray-500">Rental Period</p>
                    <p>
                      {booking.pickupDate.split("T")[0]} to{" "}
                      {booking.returnDate.split("T")[0]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-3">
                  <img
                    src={assets.location_icon_colored}
                    alt=""
                    className="w-4 h-4 mt-1"
                  />
                  <div>
                    <p className="text-gray-500">Pick-up Location</p>
                    <p>{car.location}</p>
                  </div>
                </div>
              </div>

              {/* Prices */}
              <div className="md:col-span-1 flex flex-col justify-between gap-6 text-right">
                <div className="text-sm text-gray-500">
                  <p>Total Price</p>
                  <h1 className="text-2xl font-semibold text-primary">
                    {currency}
                    {booking.price}
                  </h1>
                  <p>Booked on {booking.createdAt.split("T")[0]}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MyBookings;
