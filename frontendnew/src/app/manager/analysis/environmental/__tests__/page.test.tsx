import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import EnvironmentalAnalysisPage from '../page';

// Mock data
const mockAnalysisData = {
  success: true,
  analysis_parameters: {
    order_volume: 1000,
    include_materials: true,
    include_transport: true
  },
  overall_statistics: {
    total_suppliers_analyzed: 2,
    average_score: 75.5,
    best_score: 85,
    worst_score: 66,
    total_carbon_footprint: 140,
    total_energy_consumption: 1800
  },
  supplier_analyses: [
    {
      supplier_id: 1,
      supplier_name: 'Eco Supplier 1',
      environmental_score: 85,
      carbon_footprint: 80,
      sustainability_level: 'High',
      impact_breakdown: {
        energy: {
          consumption: 1000,
          renewable_percentage: 60,
          impact_score: 0.4
        },
        water: {
          usage: 50,
          impact_score: 0.3
        },
        waste: {
          generated: 25,
          recycling_rate: 75,
          impact_score: 0.25
        },
        emissions: {
          direct_emissions: 80,
          impact_score: 0.35
        }
      },
      certifications: ['ISO14001', 'ISO50001'],
      recommendations: ['Increase renewable energy usage', 'Optimize water consumption'],
      transport_mode: 'road',
      material_count: 2,
      metrics: {
        energy_consumption: 1000,
        water_usage: 50,
        waste_generated: 25,
        recycling_rate: 75,
        renewable_energy: 60
      }
    },
    {
      supplier_id: 2,
      supplier_name: 'Eco Supplier 2',
      environmental_score: 66,
      carbon_footprint: 60,
      sustainability_level: 'Medium',
      impact_breakdown: {
        energy: {
          consumption: 800,
          renewable_percentage: 80,
          impact_score: 0.3
        },
        water: {
          usage: 40,
          impact_score: 0.25
        },
        waste: {
          generated: 20,
          recycling_rate: 85,
          impact_score: 0.2
        },
        emissions: {
          direct_emissions: 60,
          impact_score: 0.3
        }
      },
      certifications: ['ISO14001', 'LEED'],
      recommendations: ['Implement energy efficiency measures'],
      transport_mode: 'rail',
      material_count: 2,
      metrics: {
        energy_consumption: 800,
        water_usage: 40,
        waste_generated: 20,
        recycling_rate: 85,
        renewable_energy: 80
      }
    }
  ],
  recommendations: {
    top_performer: {
      supplier_id: 1,
      supplier_name: 'Eco Supplier 1',
      environmental_score: 85,
      sustainability_level: 'High'
    },
    improvement_opportunities: [
      'Implement supplier environmental scoring system',
      'Establish minimum environmental standards'
    ]
  }
};

const mockSummaryData = {
  success: true,
  summary: {
    total_suppliers: 2,
    certification_distribution: {
      'ISO14001': 2,
      'ISO50001': 1,
      'LEED': 1
    },
    environmental_statistics: {
      average_carbon_footprint: 70,
      average_renewable_energy: 70,
      total_certified_suppliers: 2
    },
    transportation_distribution: {
      'road': 1,
      'rail': 1
    }
  }
};

// Mock fetch
global.fetch = jest.fn();

describe('EnvironmentalAnalysisPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API responses
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAnalysisData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSummaryData)
      }));
  });

  it('renders loading state initially', () => {
    render(<EnvironmentalAnalysisPage />);
    expect(screen.getByText('Analyzing supplier environmental impact...')).toBeInTheDocument();
  });

  it('renders overview dashboard after loading', async () => {
    render(<EnvironmentalAnalysisPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Environmental Impact Analysis')).toBeInTheDocument();
    });
    
    // Check overview metrics
    expect(screen.getByText('2')).toBeInTheDocument(); // Total suppliers
    expect(screen.getByText('75.5')).toBeInTheDocument(); // Average score
    expect(screen.getByText('140 t')).toBeInTheDocument(); // Carbon footprint
  });

  it('allows switching between tabs', async () => {
    render(<EnvironmentalAnalysisPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Environmental Impact Analysis')).toBeInTheDocument();
    });
    
    // Click on different tabs
    fireEvent.click(screen.getByText('Supplier Analysis'));
    expect(screen.getByText('Supplier Environmental Analysis')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Impact Breakdown'));
    expect(screen.getByText('Environmental Impact Breakdown')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Recommendations'));
    expect(screen.getByText('Environmental Action Plan')).toBeInTheDocument();
  });

  it('displays supplier analysis correctly', async () => {
    render(<EnvironmentalAnalysisPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Environmental Impact Analysis')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Supplier Analysis'));
    
    // Check supplier details
    expect(screen.getByText('Eco Supplier 1')).toBeInTheDocument();
    expect(screen.getByText('85.0')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('handles analysis parameter changes', async () => {
    render(<EnvironmentalAnalysisPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Environmental Impact Analysis')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Supplier Analysis'));
    
    // Change order volume
    const orderVolumeInput = screen.getByLabelText('Order Volume');
    fireEvent.change(orderVolumeInput, { target: { value: '2000' } });
    
    // Toggle parameters
    const materialsCheckbox = screen.getByLabelText('Include Materials');
    const transportCheckbox = screen.getByLabelText('Include Transport');
    
    fireEvent.click(materialsCheckbox);
    fireEvent.click(transportCheckbox);
    
    // Click update
    fireEvent.click(screen.getByText('Update Analysis'));
    
    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('order_volume=2000'),
      expect.any(Object)
    );
  });

  it('displays error state correctly', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject('API Error'));
    
    render(<EnvironmentalAnalysisPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  it('allows refreshing analysis data', async () => {
    render(<EnvironmentalAnalysisPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Environmental Impact Analysis')).toBeInTheDocument();
    });
    
    const refreshButton = screen.getByText('Refresh Analysis');
    fireEvent.click(refreshButton);
    
    expect(global.fetch).toHaveBeenCalledTimes(4); // Initial loads (2) + refresh (2)
  });

  it('displays impact breakdown metrics correctly', async () => {
    render(<EnvironmentalAnalysisPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Environmental Impact Analysis')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Impact Breakdown'));
    
    // Check impact metrics
    expect(screen.getByText('Energy Usage Analysis')).toBeInTheDocument();
    expect(screen.getByText('Water Usage Analysis')).toBeInTheDocument();
    expect(screen.getByText('Waste Management Analysis')).toBeInTheDocument();
  });

  it('displays recommendations correctly', async () => {
    render(<EnvironmentalAnalysisPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Environmental Impact Analysis')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Recommendations'));
    
    // Check recommendations sections
    expect(screen.getByText('Best Environmental Practices')).toBeInTheDocument();
    expect(screen.getByText('Environmental Action Plan')).toBeInTheDocument();
    expect(screen.getByText('Short-term Actions (0-6 months)')).toBeInTheDocument();
  });
}); 