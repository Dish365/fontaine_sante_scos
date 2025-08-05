import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

interface ChartProps {
  data: any;
  type: 'emissions' | 'energy' | 'water' | 'waste';
}

export const SupplierComparisonChart = ({ data, type }: ChartProps) => {
  const chartData = data.supplier_analyses.map((supplier: any) => ({
    name: supplier.supplier_name,
    score: supplier.environmental_score,
    emissions: supplier.carbon_footprint,
    energy: supplier.metrics.energy_consumption,
    water: supplier.metrics.water_usage,
    waste: supplier.metrics.waste_generated,
    renewable: supplier.metrics.renewable_energy,
    recycling: supplier.metrics.recycling_rate
  }));

  const getYAxisLabel = () => {
    switch (type) {
      case 'emissions': return 'CO2e (tonnes)';
      case 'energy': return 'Energy (kWh)';
      case 'water': return 'Water (m³)';
      case 'waste': return 'Waste (kg)';
      default: return '';
    }
  };

  const getValue = (type: string) => {
    switch (type) {
      case 'emissions': return 'emissions';
      case 'energy': return 'energy';
      case 'water': return 'water';
      case 'waste': return 'waste';
      default: return 'score';
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey={getValue(type)} fill="#22c55e" />
        {type === 'energy' && <Bar dataKey="renewable" fill="#3b82f6" />}
        {type === 'waste' && <Bar dataKey="recycling" fill="#3b82f6" />}
      </BarChart>
    </ResponsiveContainer>
  );
};

export const CertificationDistributionChart = ({ data }: { data: any }) => {
  const certData = Object.entries(data.summary.certification_distribution).map(([name, value]) => ({
    name,
    value
  }));

  const renderLabel = (props: PieLabelRenderProps) => {
    const { name, percent } = props;
    return name && percent ? `${name} (${(percent * 100).toFixed(0)}%)` : '';
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={certData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {certData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const EnvironmentalTrendsChart = ({ data }: { data: any }) => {
  const trendData = data.supplier_analyses.map((supplier: any) => ({
    name: supplier.supplier_name,
    score: supplier.environmental_score,
    energy: supplier.impact_breakdown.energy.impact_score * 100,
    water: supplier.impact_breakdown.water.impact_score * 100,
    waste: supplier.impact_breakdown.waste.impact_score * 100,
    emissions: supplier.impact_breakdown.emissions.impact_score * 100
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Impact Score (%)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="energy" stroke="#22c55e" />
        <Line type="monotone" dataKey="water" stroke="#3b82f6" />
        <Line type="monotone" dataKey="waste" stroke="#f59e0b" />
        <Line type="monotone" dataKey="emissions" stroke="#ef4444" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const TransportationDistributionChart = ({ data }: { data: any }) => {
  const transportData = Object.entries(data.summary.transportation_distribution).map(([mode, count]) => ({
    name: mode.charAt(0).toUpperCase() + mode.slice(1),
    value: count
  }));

  const renderLabel = (props: PieLabelRenderProps) => {
    const { name, percent } = props;
    return name && percent ? `${name} (${(percent * 100).toFixed(0)}%)` : '';
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={transportData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {transportData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const EnvironmentalMetricsGrid = ({ data }: { data: any }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <SupplierComparisonChart data={data} type="emissions" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environmental Impact Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <EnvironmentalTrendsChart data={data} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Certification Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <CertificationDistributionChart data={data} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transportation Modes</CardTitle>
        </CardHeader>
        <CardContent>
          <TransportationDistributionChart data={data} />
        </CardContent>
      </Card>
    </div>
  );
}; 