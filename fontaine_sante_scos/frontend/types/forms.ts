interface MaterialFormData {
  name: string;
  type: string;
  description: string;
  quantity: number;
  unit: string;
  quality: {
    score: number;
    defectRate: number;
    consistencyScore: number;
  };
  environmentalData: {
    carbonFootprint: number;
    waterUsage: number;
    landUse: number;
    biodiversityImpact: string;
  };
}
