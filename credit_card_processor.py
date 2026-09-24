import re
import random
import time

class CreditCardProcessor:
    """
    A state-of-the-art Credit Card Processing Module for the Airline Reservation System.
    This module simulates payment gateway interactions, Luhn's algorithm validation,
    and secure transaction logging.
    """

    def __init__(self):
        self.supported_networks = {
            "Visa": r"^4[0-9]{12}(?:[0-9]{3})?$",
            "MasterCard": r"^5[1-5][0-9]{14}$",
            "American Express": r"^3[47][0-9]{13}$",
            "Discover": r"^6(?:011|5[0-9]{2})[0-9]{12}$"
        }

    def validate_card_number(self, card_number: str) -> bool:
        """
        Validates the credit card number using Luhn's Algorithm.
        """
        # Remove whitespace and non-digit characters
        card_number = re.sub(r'\D', '', card_number)
        
        if not card_number:
            return False

        digits = [int(d) for d in card_number]
        # Double every second digit from the right
        for i in range(len(digits) - 2, -1, -2):
            digits[i] *= 2
            if digits[i] > 9:
                digits[i] -= 9
        
        return sum(digits) % 10 == 0

    def get_card_network(self, card_number: str) -> str:
        """
        Identifies the card network (Visa, MasterCard, etc.) based on the number.
        """
        card_number = re.sub(r'\D', '', card_number)
        for network, pattern in self.supported_networks.items():
            if re.match(pattern, card_number):
                return network
        return "Unknown"

    def process_transaction(self, card_name: str, card_number: str, expiry: str, cvv: str, amount: float):
        """
        Simulates the end-to-end processing of a credit card transaction.
        """
        print(f"\n[SYSTEM] Initiating Transaction for: {card_name}")
        print(f"[SYSTEM] Amount to Charge: ₹{amount:,.2f}")
        
        # 1. Basic Validation
        if not self.validate_card_number(card_number):
            print("[ERROR] Invalid Card Number: Failed Luhn Check.")
            return {"success": False, "message": "Invalid Card Number"}

        network = self.get_card_network(card_number)
        print(f"[INFO] Card Network Detected: {network}")

        # 2. CVV and Expiry Validation (Mock)
        if len(cvv) not in [3, 4]:
            print("[ERROR] Invalid CVV format.")
            return {"success": False, "message": "Invalid CVV"}

        # 3. Secure Gateway Communication Simulation
        print("[PROCESS] Connecting to Secure Payment Gateway...")
        time.sleep(1.5) # Simulate network latency
        
        # Simulate success/failure
        # In a real system, this would call a Stripe/PayPal API
        is_successful = random.random() > 0.1 # 90% success rate
        
        if is_successful:
            transaction_id = f"TXN-{random.randint(100000, 999999)}"
            print(f"[SUCCESS] Transaction Approved! ID: {transaction_id}")
            return {
                "success": True,
                "transaction_id": transaction_id,
                "network": network,
                "message": "Payment Processed Successfully"
            }
        else:
            print("[FAILURE] Transaction Declined by Issuing Bank.")
            return {
                "success": False,
                "message": "Transaction Declined"
            }

if __name__ == "__main__":
    # Example usage for testing
    processor = CreditCardProcessor()
    
    # Test Data (Standard Visa test number)
    test_card = "4242 4242 4242 4242"
    result = processor.process_transaction(
        card_name="John Doe",
        card_number=test_card,
        expiry="12/26",
        cvv="123",
        amount=12500.50
    )
    
    print("\n--- Final Receipt ---")
    print(result)
