import React from 'react';

const AnimatedInput = ({ id, type = "text", value, onChange, label }) => {
  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required
        placeholder=" "
        className="peer w-full bg-white/80 backdrop-blur p-3 pt-6 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
      />
      <label
        htmlFor={id}
        className="absolute left-3 top-3 text-gray-500 text-sm transition-all 
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
        peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600 pointer-events-none"
      >
        {label}
      </label>
    </div>
  );
};

export default AnimatedInput;
