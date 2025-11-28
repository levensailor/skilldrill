import Link from 'next/link';
import { FaQuestionCircle, FaClipboardList, FaUserTie } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Technical Interview App
          </h1>
          <p className="text-xl text-gray-600">
            Manage questions, create tests, and conduct interviews
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link
            href="/questions"
            className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="flex flex-col items-center text-center p-8">
              <div className="rounded-full bg-blue-100 p-6 mb-4 transition group-hover:bg-blue-200">
                <FaQuestionCircle className="text-4xl text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Questions
              </h2>
              <p className="text-sm text-gray-600">
                Create and manage interview questions organized by categories
              </p>
            </div>
          </Link>

          <Link
            href="/tests"
            className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="flex flex-col items-center text-center p-8">
              <div className="rounded-full bg-green-100 p-6 mb-4 transition group-hover:bg-green-200">
                <FaClipboardList className="text-4xl text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Tests
              </h2>
              <p className="text-sm text-gray-600">
                Build tests by selecting questions from different categories
              </p>
            </div>
          </Link>

          <Link
            href="/interviews"
            className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="flex flex-col items-center text-center p-8">
              <div className="rounded-full bg-purple-100 p-6 mb-4 transition group-hover:bg-purple-200">
                <FaUserTie className="text-4xl text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Interviews
              </h2>
              <p className="text-sm text-gray-600">
                Conduct interviews and score candidate responses
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
