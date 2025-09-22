// controllers/paymentController.js
const handleEsewaPayment = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;
    // Add your eSewa integration logic here
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update payment status
    appointment.paymentStatus = "completed";
    appointment.paymentDetails = {
      transactionId: req.body.transactionId,
      amount: amount,
      paymentDate: new Date(),
    };
    await appointment.save();

    res.json({ message: "Payment successful", appointment });
  } catch (error) {
    res.status(400);
    throw new Error("Payment failed");
  }
};
