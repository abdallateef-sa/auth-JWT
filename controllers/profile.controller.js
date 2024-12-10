import user from "../models/user.model.js";

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; 

    const foundUser = await user.findById(userId);

    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        dateOfBirth: foundUser.dateOfBirth,
        gender: foundUser.gender,
        phone: foundUser.phone,
        country: foundUser.country,
        address: foundUser.address,
        role: foundUser.role,
      }
    });
  } catch (error) {
    next(error);
  }
};