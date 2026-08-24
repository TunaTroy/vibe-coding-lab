import React from 'react';

function ResultModal({ isOpen, onClose, onBackToHome, result }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Kết quả</h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Điểm số:</span>
            <span className="text-2xl font-bold text-blue-600">{result.score}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Số sao:</span>
            <div className="flex space-x-1">
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  className={`text-2xl ${
                    star <= result.stars ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {result.coinAwarded > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                +{result.coinAwarded} Đô la Đạt
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Chơi lại
          </button>
          <button
            onClick={onBackToHome}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultModal;
