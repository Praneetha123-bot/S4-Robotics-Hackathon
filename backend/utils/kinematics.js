/**
 * Robot Kinematics Utilities
 * ===========================
 * 
 * Provides robot-relative movement calculations for humanoid robot.
 * All movement is relative to the robot's facing direction (theta).
 * 
 * Coordinate System:
 * - X-axis: Horizontal (positive = right in world view)
 * - Y-axis: Vertical (positive = up in world view)  
 * - Theta: Rotation around Z-axis (0 = facing +X direction)
 * 
 * Movement Equations:
 * - Forward:  x' = x + cos(θ) * speed, y' = y + sin(θ) * speed
 * - Backward: x' = x - cos(θ) * speed, y' = y - sin(θ) * speed
 * - Right:    x' = x - sin(θ) * speed, y' = y + cos(θ) * speed
 * - Left:     x' = x + sin(θ) * speed, y' = y - cos(θ) * speed
 * 
 * Author: Fitfest25 Hackathon Team
 * Date: 2025
 */

/**
 * Normalize angle to range [-π, π]
 * @param {number} theta - Angle in radians
 * @returns {number} Normalized angle
 */
function normalizeTheta(theta) {
  while (theta > Math.PI) {
    theta -= 2 * Math.PI;
  }
  while (theta < -Math.PI) {
    theta += 2 * Math.PI;
  }
  return theta;
}

/**
 * Move forward in direction of theta
 * @param {Object} pose - Current pose {x, y, theta}
 * @param {number} speed - Movement speed (meters)
 * @returns {Object} New pose {x, y, theta}
 */
function moveForward(pose, speed) {
  return {
    x: pose.x + Math.cos(pose.theta) * speed,
    y: pose.y + Math.sin(pose.theta) * speed,
    theta: pose.theta
  };
}

/**
 * Move backward opposite to theta
 * @param {Object} pose - Current pose {x, y, theta}
 * @param {number} speed - Movement speed (meters)
 * @returns {Object} New pose {x, y, theta}
 */
function moveBackward(pose, speed) {
  return {
    x: pose.x - Math.cos(pose.theta) * speed,
    y: pose.y - Math.sin(pose.theta) * speed,
    theta: pose.theta
  };
}

/**
 * Strafe right (perpendicular to facing direction, 90° clockwise)
 * @param {Object} pose - Current pose {x, y, theta}
 * @param {number} speed - Movement speed (meters)
 * @returns {Object} New pose {x, y, theta}
 */
function strafeRight(pose, speed) {
  // For human-like movement: right is perpendicular to facing direction
  // Right = -sin(theta) for x, +cos(theta) for y
  return {
    x: pose.x - Math.sin(pose.theta) * speed,
    y: pose.y + Math.cos(pose.theta) * speed,
    theta: pose.theta // No rotation during strafe
  };
}

/**
 * Strafe left (perpendicular to facing direction, 90° counter-clockwise)
 * @param {Object} pose - Current pose {x, y, theta}
 * @param {number} speed - Movement speed (meters)
 * @returns {Object} New pose {x, y, theta}
 */
function strafeLeft(pose, speed) {
  // For human-like movement: left is perpendicular to facing direction
  // Left = +sin(theta) for x, -cos(theta) for y
  return {
    x: pose.x + Math.sin(pose.theta) * speed,
    y: pose.y - Math.cos(pose.theta) * speed,
    theta: pose.theta // No rotation during strafe
  };
}

/**
 * Apply movement command to current pose
 * @param {Object} pose - Current pose {x, y, theta}
 * @param {string} command - Movement command: 'forward', 'backward', 'left', 'right'
 * @param {number} speed - Movement speed (meters)
 * @returns {Object} New pose {x, y, theta} or null if invalid command
 */
function applyMovement(pose, command, speed = 0.02) {
  // Normalize theta before calculation
  const normalizedPose = {
    x: pose.x,
    y: pose.y,
    theta: normalizeTheta(pose.theta)
  };
  
  switch (command) {
    case 'forward':
      return moveForward(normalizedPose, speed);
    case 'backward':
      return moveBackward(normalizedPose, speed);
    case 'left':
      return strafeLeft(normalizedPose, speed);
    case 'right':
      return strafeRight(normalizedPose, speed);
    case 'stop':
      return normalizedPose;
    default:
      return null;
  }
}

/**
 * Calculate distance between two poses
 * @param {Object} pose1 - First pose {x, y}
 * @param {Object} pose2 - Second pose {x, y}
 * @returns {number} Euclidean distance
 */
function distance(pose1, pose2) {
  const dx = pose2.x - pose1.x;
  const dy = pose2.y - pose1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle difference (shortest path)
 * @param {number} theta1 - First angle (radians)
 * @param {number} theta2 - Second angle (radians)
 * @returns {number} Angle difference in range [-π, π]
 */
function angleDifference(theta1, theta2) {
  let diff = theta2 - theta1;
  return normalizeTheta(diff);
}

module.exports = {
  normalizeTheta,
  moveForward,
  moveBackward,
  strafeRight,
  strafeLeft,
  applyMovement,
  distance,
  angleDifference
};
