from sklearn.cluster import KMeans
from sklearn.preprocessing import LabelEncoder, StandardScaler
import pandas as pd
import numpy as np

def generate_business_insights(df, segment_data, segment_id, numeric_cols, categorical_cols):
    """Generate professional business insights"""
    
    size = len(segment_data)
    total_size = len(df)
    percentage = round((size / total_size) * 100, 1)
    
    # Segment size classification
    if size < 30:
        size_type = "exclusive, high-value"
        campaign_type = "premium, personalized marketing campaigns"
    elif size < 100:
        size_type = "specialized"
        campaign_type = "targeted campaigns and A/B testing"
    elif size > 200:
        size_type = "mainstream, high-volume"
        campaign_type = "broad marketing initiatives and product launches"
    else:
        size_type = "well-defined"
        campaign_type = "focused marketing strategies"
    
    # Start building the insight
    insight = f"This {size_type} segment represents {percentage}% of your customer base ({size} customers)"
    
    # Analyze numeric patterns for business insights
    behavioral_insights = []
    if numeric_cols:
        for col in numeric_cols[:2]:  # Focus on top 2 most important columns
            if col in segment_data.columns and col in df.columns:
                segment_avg = segment_data[col].mean()
                overall_avg = df[col].mean()
                
                col_name = col.replace('_', ' ').replace('amt', 'amount').title()
                
                if segment_avg > overall_avg * 1.3:
                    behavioral_insights.append(f"significantly higher {col_name.lower()}")
                elif segment_avg > overall_avg * 1.1:
                    behavioral_insights.append(f"above-average {col_name.lower()}")
                elif segment_avg < overall_avg * 0.7:
                    behavioral_insights.append(f"cost-conscious {col_name.lower()} behavior")
    
    # Add categorical insights
    if categorical_cols:
        for col in categorical_cols[:1]:  # Just the most important categorical
            if col in segment_data.columns:
                mode_val = segment_data[col].mode()
                if len(mode_val) > 0 and str(mode_val.iloc[0]).lower() not in ['unknown', 'null', 'nan']:
                    col_name = col.replace('_', ' ').title()
                    behavioral_insights.append(f"predominantly {mode_val.iloc[0]} in {col_name.lower()}")
    
    # Combine behavioral insights
    if behavioral_insights:
        insight += f", characterized by {' and '.join(behavioral_insights[:2])}"
    
    # Add business recommendation
    insight += f". Optimal for {campaign_type} with strong potential for customer lifetime value optimization."
    
    return insight

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
            converted = pd.to_numeric(df[col], errors='coerce')
            if converted.notna().sum() / len(df) > 0.7:
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
        for col in numeric_cols:
            if numeric_data[col].isna().any():
                numeric_data[col] = numeric_data[col].fillna(numeric_data[col].median())
        features_df = pd.concat([features_df, numeric_data], axis=1)
    
    # Encode categorical columns
    label_encoders = {}
    if categorical_cols:
        for col in categorical_cols:
            mode_val = df[col].mode()
            fill_val = mode_val[0] if len(mode_val) > 0 else "Unknown"
            df[col] = df[col].fillna(fill_val)
            
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
    
    # Generate segment summary with intelligent insights
    segment_summary = {}
    segment_insights = {}
    
    for i in range(n_clusters):
        segment_data = result_df[result_df["segment"] == i]
        segment_summary[f"Segment_{i}"] = {
            "count": len(segment_data),
            "percentage": round(len(segment_data) / len(result_df) * 100, 1)
        }
        
        # Add numeric summaries
        if numeric_cols:
            for col in numeric_cols:
                if col in segment_data.columns:
                    segment_summary[f"Segment_{i}"][f"avg_{col}"] = round(segment_data[col].mean(), 2)
        
        # Generate business insights
    segment_insights[f"Segment_{i}"] = generate_business_insights(
        df, segment_data, i, numeric_cols, categorical_cols
    )

    
    return {
    "segments": result_df.to_dict(orient="records"),
    "summary": f"{len(result_df)} records intelligently segmented into {n_clusters} actionable customer groups using advanced clustering analysis",
    "segment_details": segment_summary,
    "segment_insights": segment_insights,  # These will be available immediately
    "features_used": list(features_df.columns),
    "numeric_columns": numeric_cols,
    "categorical_columns": categorical_cols
}