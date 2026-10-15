<?php

/**
 * India-first starter geography adapted from Chess-Mission.
 * Coordinates are city centers; this is not a complete list of Indian cities.
 */
$city = fn (string $name, float $latitude, float $longitude): array => [
    'name' => $name,
    'latitude' => $latitude,
    'longitude' => $longitude,
    'timezone' => 'Asia/Kolkata',
];

return [
    'iso2' => 'IN',
    'iso3' => 'IND',
    'name' => 'India',
    'states' => [
        ['name' => 'Andhra Pradesh', 'code' => 'AP', 'cities' => [$city('Visakhapatnam', 17.686815, 83.218483)]],
        ['name' => 'Arunachal Pradesh', 'code' => 'AR', 'cities' => [$city('Itanagar', 27.084368, 93.605316)]],
        ['name' => 'Assam', 'code' => 'AS', 'cities' => [$city('Guwahati', 26.144517, 91.736237)]],
        ['name' => 'Bihar', 'code' => 'BR', 'cities' => [$city('Patna', 25.594095, 85.137566)]],
        ['name' => 'Chhattisgarh', 'code' => 'CG', 'cities' => [$city('Raipur', 21.251384, 81.629641)]],
        ['name' => 'Goa', 'code' => 'GA', 'cities' => [$city('Panaji', 15.490930, 73.827850)]],
        ['name' => 'Gujarat', 'code' => 'GJ', 'cities' => [
            $city('Ahmedabad', 23.022505, 72.571362),
            $city('Gandhinagar', 23.215635, 72.636941),
            $city('Surat', 21.170240, 72.831062),
            $city('Vadodara', 22.307159, 73.181219),
            $city('Rajkot', 22.303894, 70.802160),
        ]],
        ['name' => 'Haryana', 'code' => 'HR', 'cities' => [$city('Gurugram', 28.459497, 77.026638)]],
        ['name' => 'Himachal Pradesh', 'code' => 'HP', 'cities' => [$city('Shimla', 31.104814, 77.173403)]],
        ['name' => 'Jharkhand', 'code' => 'JH', 'cities' => [$city('Ranchi', 23.344100, 85.137566)]],
        ['name' => 'Karnataka', 'code' => 'KA', 'cities' => [$city('Bengaluru', 12.971599, 77.594563)]],
        ['name' => 'Kerala', 'code' => 'KL', 'cities' => [$city('Thiruvananthapuram', 8.524139, 76.936638)]],
        ['name' => 'Madhya Pradesh', 'code' => 'MP', 'cities' => [$city('Bhopal', 23.259933, 77.412615)]],
        ['name' => 'Maharashtra', 'code' => 'MH', 'cities' => [$city('Mumbai', 19.075984, 72.877656), $city('Pune', 18.520430, 73.856744)]],
        ['name' => 'Manipur', 'code' => 'MN', 'cities' => [$city('Imphal', 24.817011, 93.936844)]],
        ['name' => 'Meghalaya', 'code' => 'ML', 'cities' => [$city('Shillong', 25.578773, 91.893254)]],
        ['name' => 'Mizoram', 'code' => 'MZ', 'cities' => [$city('Aizawl', 23.727107, 92.717639)]],
        ['name' => 'Nagaland', 'code' => 'NL', 'cities' => [$city('Kohima', 25.674674, 94.110031)]],
        ['name' => 'Odisha', 'code' => 'OD', 'cities' => [$city('Bhubaneswar', 20.296059, 85.824540)]],
        ['name' => 'Punjab', 'code' => 'PB', 'cities' => [$city('Ludhiana', 30.900965, 75.857276)]],
        ['name' => 'Rajasthan', 'code' => 'RJ', 'cities' => [$city('Jaipur', 26.912434, 75.787271)]],
        ['name' => 'Sikkim', 'code' => 'SK', 'cities' => [$city('Gangtok', 27.338936, 88.606506)]],
        ['name' => 'Tamil Nadu', 'code' => 'TN', 'cities' => [$city('Chennai', 13.082680, 80.270718)]],
        ['name' => 'Telangana', 'code' => 'TG', 'cities' => [$city('Hyderabad', 17.385044, 78.486671)]],
        ['name' => 'Tripura', 'code' => 'TR', 'cities' => [$city('Agartala', 23.831457, 91.286778)]],
        ['name' => 'Uttar Pradesh', 'code' => 'UP', 'cities' => [$city('Lucknow', 26.846694, 80.946166)]],
        ['name' => 'Uttarakhand', 'code' => 'UK', 'cities' => [$city('Dehradun', 30.316496, 78.032192)]],
        ['name' => 'West Bengal', 'code' => 'WB', 'cities' => [$city('Kolkata', 22.572646, 88.363895)]],
        ['name' => 'Delhi', 'code' => 'DL', 'cities' => [$city('New Delhi', 28.613939, 77.209021)]],
        ['name' => 'Chandigarh', 'code' => 'CH', 'cities' => [$city('Chandigarh', 30.733315, 76.779418)]],
        ['name' => 'Jammu and Kashmir', 'code' => 'JK', 'cities' => [$city('Srinagar', 34.083671, 74.797282)]],
        ['name' => 'Ladakh', 'code' => 'LA', 'cities' => [$city('Leh', 34.152588, 77.577049)]],
        ['name' => 'Puducherry', 'code' => 'PY', 'cities' => [$city('Puducherry', 11.941591, 79.808313)]],
        ['name' => 'Andaman and Nicobar Islands', 'code' => 'AN', 'cities' => [$city('Port Blair', 11.623377, 92.726483)]],
        ['name' => 'Dadra and Nagar Haveli and Daman and Diu', 'code' => 'DH', 'cities' => [$city('Daman', 20.397373, 72.832802)]],
        ['name' => 'Lakshadweep', 'code' => 'LD', 'cities' => [$city('Kavaratti', 10.559320, 72.635813)]],
    ],
];
