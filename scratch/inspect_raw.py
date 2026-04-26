import pandas as pd
df = pd.read_excel("Revenue Radar (R-Jay).xlsx", header=None)
print("TOP 5 ROWS:")
print(df.head(5).to_string())
