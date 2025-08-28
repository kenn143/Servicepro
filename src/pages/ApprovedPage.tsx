
import PageMeta from "../components/common/PageMeta";

const ApprovedPage: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Reactjs"
        description="Dashboard Template"
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendars">
                    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md w-full">
                <div className="text-4xl mb-4">✅</div>
                <h1 className="text-xl font-semibold text-green-700">
                You have successfully approved the quote.
                </h1>
                <p className="text-gray-600 mt-4">
                </p>
            </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default ApprovedPage;
