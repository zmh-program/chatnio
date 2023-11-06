import InfoBox from "@/components/admin/InfoBox.tsx";
import ChartBox from "@/components/admin/ChartBox.tsx";

function DashBoard() {
  return (
    <div className={`dashboard`}>
      <InfoBox />
      <ChartBox />
    </div>
  );
}

export default DashBoard;
