from typing import Dict, Any, List
from ..schemas.quality import QualityInput, QualityAssessment
from ..exceptions import ValidationError, CalculationError

class QualityEngine:
    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Convert dict to QualityInput
            input_data = QualityInput(**data)
            return await self.assess_quality(input_data)
        except Exception as e:
            raise CalculationError(f"Error in quality calculation: {str(e)}")

    async def assess_quality(
        self,
        data: QualityInput
    ) -> QualityAssessment:
        try:
            # Calculate compliance for each metric
            compliance = {}
            for metric, value in data.measurements.items():
                standard = data.standards.get(metric)
                if standard:
                    compliance[metric] = value >= standard
            
            # Calculate overall quality score
            quality_score = sum(compliance.values()) / len(compliance) * 100 if compliance else 0
            
            # Calculate risk level
            risk_level = self._calculate_risk_level(
                data.defect_rate,
                data.customer_satisfaction,
                data.compliance_score,
                data.process_efficiency
            )
            
            return QualityAssessment(
                material_id=data.material_id,
                quality_score=quality_score,
                compliance_details=compliance,
                recommendations=self._generate_recommendations(compliance),
                overall_score=quality_score,
                risk_level=risk_level,
                improvement_areas=self._identify_improvement_areas(data),
                certification_status=self._check_certifications(data.certification_status),
                audit_summary=self._summarize_audits(data.audit_history)
            )
        except ValidationError as e:
            raise e
        except Exception as e:
            raise CalculationError(f"Error assessing quality: {str(e)}")

    def _calculate_risk_level(
        self,
        defect_rate: float,
        customer_satisfaction: float,
        compliance_score: float,
        process_efficiency: float
    ) -> str:
        # Simple risk calculation
        risk_score = (
            (100 - defect_rate) * 0.3 +
            customer_satisfaction * 0.3 +
            compliance_score * 0.2 +
            process_efficiency * 0.2
        )
        
        if risk_score >= 80:
            return "Low"
        elif risk_score >= 60:
            return "Medium"
        else:
            return "High"

    def _identify_improvement_areas(self, data: QualityInput) -> List[str]:
        areas = []
        if data.defect_rate > 5:
            areas.append("Defect rate reduction")
        if data.customer_satisfaction < 80:
            areas.append("Customer satisfaction improvement")
        if data.compliance_score < 90:
            areas.append("Compliance enhancement")
        if data.process_efficiency < 85:
            areas.append("Process efficiency optimization")
        return areas

    def _check_certifications(self, certifications: List[str]) -> Dict[str, bool]:
        required_certs = {
            "ISO9001": False,
            "ISO14001": False,
            "ISO45001": False
        }
        for cert in certifications:
            if cert in required_certs:
                required_certs[cert] = True
        return required_certs

    def _summarize_audits(self, audit_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not audit_history:
            return {"status": "No audit history available"}
            
        return {
            "total_audits": len(audit_history),
            "last_audit_date": audit_history[-1].get("date"),
            "average_score": sum(a.get("score", 0) for a in audit_history) / len(audit_history),
            "major_findings": [
                finding for audit in audit_history
                for finding in audit.get("findings", [])
                if finding.get("severity") == "major"
            ]
        }

    def _generate_recommendations(self, compliance: Dict[str, bool]) -> List[str]:
        recommendations = []
        for metric, compliant in compliance.items():
            if not compliant:
                recommendations.append(f"Improve {metric} to meet standards")
        return recommendations 