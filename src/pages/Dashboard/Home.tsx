import { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import PageMeta from "../../components/common/PageMeta";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Home() {
  const [isEditable, setIsEditable] = useState(false);

  const layout = [
    { i: "metrics", x: 0, y: 0, w: 6, h: 3 },
    { i: "sales", x: 6, y: 0, w: 6, h: 5 },
  ];

  return (
    <>
      <PageMeta title="ServicePros" description="" />

      <div className="p-2 bg-gray-50 min-h-screen">
        {/* Header with toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
          
          </h1>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">
              Enable Editing
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isEditable}
                onChange={() => setIsEditable(!isEditable)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>

        {/* Draggable Grid */}
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          isDraggable={isEditable}
          isResizable={isEditable}
          margin={[20, 20]} // spacing between boxes
          containerPadding={[0, 0]} // align cleanly inside
          draggableHandle=".drag-handle"
        >
          <div
            key="metrics"
            className="bg-white rounded-2xl shadow p-5 relative flex flex-col justify-between"
          >
            {isEditable && (
              <div className="drag-handle cursor-move text-gray-400 text-sm mb-2 self-start">
                ⠿ Drag
              </div>
            )}
            <EcommerceMetrics />
          </div>

          <div
            key="sales"
            className="bg-white rounded-2xl shadow p-5 relative flex flex-col justify-between"
          >
            {isEditable && (
              <div className="drag-handle cursor-move text-gray-400 text-sm mb-2 self-start">
                ⠿ Drag
              </div>
            )}
            <MonthlySalesChart />
          </div>
        </ResponsiveGridLayout>
      </div>
    </>
  );
}
