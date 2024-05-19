import Header from "./header";
import Humidities from "./humidities";
import Stats from "./stats";
import Temperatures from "./temps";

const DataDisplay = () => {
  return (
    <div className="relative overflow-auto w-full h-full grid-pattern py-4">
      <Header />
      <div className="w-full h-full p-4 flex flex-col gap-8 justify-center items-center">
        <div className="custom-gradient absolute -top-48 z-10 h-36 w-3/4 max-w-6xl opacity-100 blur-[200px]" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full place-items-center">
          <Temperatures />
          <Humidities />
        </div>
        <Stats />
      </div>
    </div>
  );
};

export default DataDisplay;
