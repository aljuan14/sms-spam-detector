// 1. Import component Dashboard yang tadi dibuat
import DataMiningDashboard from './Dashboard';

// Jika file Dashboard.jsx kamu taruh di dalam folder components, path-nya jadi:
// import DataMiningDashboard from './components/Dashboard';

function App() {
  return (
    // 2. Tampilkan di sini
    <div>
      <DataMiningDashboard />
    </div>
  );
}

export default App;