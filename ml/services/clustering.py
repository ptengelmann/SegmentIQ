from sklearn.cluster import KMeans
from sklearn.preprocessing import LabelEncoder, StandardScaler
import pandas as pd
import numpy as np

def generate_segments(data):
    df = pd.DataFrame(data)
    
    print("\n[RAW DF]")
    print(df.head())
    print(df.dtypes)
    print(f"Shape: {df.shape}")
    
    # Remove completely empty rows/columns
    df = df.dropna(how='all').dropna(axis=1, how='all')
    
    if df.empty:
        return {"error": "DataFrame is empty after removing null rows/columns"}
    
    # Separate numeric and categorical columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'string']).columns.tolist()
    
    print(f"\nNumeric columns: {numeric_cols}")
    print(f"Categorical columns: {categorical_cols}")
    
    # Try to convert string numbers to numeric
    for col in categorical_cols.copy():
        try:
            # Try converting to numeric
            converted = pd.to_numeric(df[col], errors='coerce')
            # If most values convert successfully, treat as numeric
            if converted.notna().sum() / len(df) > 0.7:  # 70% threshold
                df[col] = converted
                numeric_cols.append(col)
                categorical_cols.remove(col)
        except:
            continue
    
    # Prepare features for clustering
    features_df = pd.DataFrame()
    
    # Add numeric columns (with missing value handling)
    if numeric_cols:
        numeric_data = df[numeric_cols].copy()
        # Fill missing numeric values with median
        for col in numeric_cols:
            if numeric_data[col].isna().any():
                numeric_data[col] = numeric_data[col].fillna(numeric_data[col].median())
        features_df = pd.concat([features_df, numeric_data], axis=1)
    
    # Encode categorical columns
    label_encoders = {}
    if categorical_cols:
        for col in categorical_cols:
            # Fill missing categorical values with mode or "Unknown"
            mode_val = df[col].mode()
            fill_val = mode_val[0] if len(mode_val) > 0 else "Unknown"
            df[col] = df[col].fillna(fill_val)
            
            # Label encode
            le = LabelEncoder()
            encoded_col = le.fit_transform(df[col].astype(str))
            features_df[f"{col}_encoded"] = encoded_col
            label_encoders[col] = le
    
    print(f"\n[FEATURES FOR CLUSTERING]")
    print(features_df.head())
    print(f"Features shape: {features_df.shape}")
    
    if features_df.empty or features_df.shape[1] == 0:
        return {"error": "No features available for clustering after preprocessing"}
    
    # Scale features for better clustering
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features_df)
    
    # Determine optimal number of clusters (between 2-5)
    n_samples = len(features_df)
    n_clusters = min(max(2, n_samples // 20), 5) if n_samples > 10 else 2
    
    print(f"Using {n_clusters} clusters for {n_samples} samples")
    
    # Perform clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(features_scaled)
    
    # Add segments to original dataframe
    result_df = df.copy()
    result_df["segment"] = clusters
    
    # Generate segment summary
    segment_summary = {}
    for i in range(n_clusters):
        segment_data = result_df[result_df["segment"] == i]
        segment_summary[f"Segment_{i}"] = {
            "count": len(segment_data),
            "percentage": round(len(segment_data) / len(result_df) * 100, 1)
        }
        
        # Add numeric summaries if available
        if numeric_cols:
            for col in numeric_cols:
                if col in segment_data.columns:
                    segment_summary[f"Segment_{i}"][f"avg_{col}"] = round(segment_data[col].mean(), 2)
    
    return {
        "segments": result_df.to_dict(orient="records"),
        "summary": f"{len(result_df)} records clustered into {n_clusters} segments",
        "segment_details": segment_summary,
        "features_used": list(features_df.columns),
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols
    }