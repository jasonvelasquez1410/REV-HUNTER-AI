import pandas as pd
import sys

try:
    df = pd.read_excel("Revenue Radar (R-Jay).xlsx")
    print("COLUMNS FOUND:")
    print(df.columns.tolist())
    print("\nFIRST ROW DATA:")
    print(df.iloc[0].to_dict())
except Exception as e:
    print(f"ERROR: {e}")
