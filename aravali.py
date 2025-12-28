class NGTCalculator:
    @staticmethod
    def calculate_fine(crusher_count, days_of_violation=365):
        
        PI = 80        
        N = days_of_violation
        R = 500       
        S = 1.5       
        LF = 1.25     
        
       
        base_fine_per_unit = PI * N * R * S * LF
        
       
        total_fine_rs = base_fine_per_unit * crusher_count
        
        
        return round(total_fine_rs / 10_000_000, 2)