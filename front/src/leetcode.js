import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './leetcode.css';

function Leetcode() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [filterOption, setFilterOption] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [greaterThanValue, setGreaterThanValue] = useState('');
  const [lessThanValue, setLessThanValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5009/api/getExcelData');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setData(data);
        setFilteredData(data);
        setSearchResult(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleUpdateData = async () => {
    try {
      const response = await fetch('http://localhost:5009/api/updateData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include the following line if you need to send data to the server
        // body: JSON.stringify({ key: 'value' }),
      });
  
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
  
      const responseData = await response.json();
  
      console.log(responseData.message);
      alert(responseData.message); // You can remove this line if you don't want an alert
  
      // After a successful update, you might want to fetch fresh data
      // Uncomment the following line if you want to fetch data after the update
      // fetchData();
    } catch (error) {
      console.error('Error updating data:', error);
      alert(`Error updating data: ${error.message}`);
    }
  };
  

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      const searchTermLowerCase = searchTerm.toLowerCase();
      const result = data.filter((item) => {
        const rollNoLowerCase = item['Roll No'].toLowerCase();
        return rollNoLowerCase.includes(searchTermLowerCase);
      });
      setSearchResult(result);
      setFilteredData(result);
      setShowSearch(true);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResult([]);
    setFilteredData(data);
    setShowSearch(false);
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
    setGreaterThanValue('');
    setLessThanValue('');

    if (e.target.value === 'all') {
      setFilteredData(data);
    } else {
      const sortedData = [...data].sort((a, b) => {
        const valueA = parseValue(a[e.target.value]);
        const valueB = parseValue(b[e.target.value]);
        return valueB - valueA;
      });
      setFilteredData(sortedData);
    }
  };

  const parseValue = (value) => {
    if (typeof value === 'string' && value.includes(',')) {
      return parseFloat(value.replace(/,/g, ''));
    }
    return value;
  };

  const handleEntriesChange = (e) => {
    setEntriesToShow(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handleGreaterThanChange = (e) => {
    setGreaterThanValue(e.target.value);
    applyRangeFilters(filterOption, e.target.value, lessThanValue);
  };

  const handleLessThanChange = (e) => {
    setLessThanValue(e.target.value);
    applyRangeFilters(filterOption, greaterThanValue, e.target.value);
  };

  const applyRangeFilters = (filterOption, greaterThan, lessThan) => {
    let filtered = [...data];

    if (greaterThan !== '') {
      filtered = filtered.filter(item => {
        const itemValue = parseFloat(getStringValue(item[filterOption]));
        return itemValue > parseFloat(greaterThan);
      });
    }

    if (lessThan !== '') {
      filtered = filtered.filter(item => {
        const itemValue = parseFloat(getStringValue(item[filterOption]));
        return itemValue < parseFloat(lessThan);
      });
    }

    if (filterOption !== 'all') {
      filtered.sort((a, b) => {
        const valueA = parseValue(a[filterOption]);
        const valueB = parseValue(b[filterOption]);
        return valueB - valueA;
      });
    }

    setFilteredData(filtered);
  };

  const getStringValue = (value) => {
    if (typeof value === 'string' && value.includes(',')) {
      return value.replace(/,/g, '');
    }

    return value;
  };

  const totalPages = Math.ceil(filteredData.length / entriesToShow);
  const indexOfLastEntry = currentPage * entriesToShow;
  const indexOfFirstEntry = indexOfLastEntry - entriesToShow;
  const currentEntries = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);

  return (
    <Router>
      <div className="leetcode-container container-fluid">
        <h1>Leetcode Data</h1>
        <button onClick={handleUpdateData}>Update Data</button>
        {showSearch ? (
          <div style={{ textAlign: 'center', margin: '20px' }}>
            <label>
              Search Roll No:{' '}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                required
              />
            </label>
            <button onClick={handleSearch}>Search</button>

            {searchResult.length > 0 && (
              <div>
                <p>Search results for Roll No: {searchTerm}</p>
                <button onClick={clearSearch}>Clear Search</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', margin: '20px' }}>
            <label>
              Search Roll No:{' '}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                required
              />
            </label>
            <button onClick={handleSearch}>Search</button>
            <p>Search for something...</p>
          </div>
        )}

        <div style={{ margin: '20px' }}>
          <label>
            Filter by:{' '}
            <select value={filterOption} onChange={handleFilterChange}>
              <option value="all">All</option>
              <option value="Total Problems Solved">Total Problems Solved</option>
              <option value="Rank">Rank</option>
              <option value="Total Submissions this year">Total Submissions this year</option>
            </select>
          </label>
          <label>
            Show entries:{' '}
            <select value={entriesToShow} onChange={handleEntriesChange}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>

          <label>
            Greater Than:{' '}
            <input
              type="number"
              value={greaterThanValue}
              onChange={handleGreaterThanChange}
            />
          </label>
          <label>
            Less Than:{' '}
            <input
              type="number"
              value={lessThanValue}
              onChange={handleLessThanChange}
            />
          </label>
        </div>

        <div className="table-container">
          <table className="table table-bordered table-striped">
            <thead>
            <tr>
              <th>S.No</th>
              <th>Roll No</th>
              <th>UserName</th>
              <th>Rank</th>
              <th>Total Problems Solved</th>
              <th>Easy</th>
              <th>Medium</th>
              <th>Hard</th>
              <th>Badges Achieved</th>
              <th>Total Submissions this year</th>
              <th>Active Days</th>
              <th>Max Streak</th>
              <th>Contest Ranking</th>
              <th>Profile Links</th>
            </tr>
            </thead>
            <tbody>
              {currentEntries.length > 0 ? (
                currentEntries.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item['Roll No']}</td>
                    <td>{item.Name}</td>
                    <td>{item.Rank}</td>
                  <td>{item['Total Problems Solved']}</td>
                  <td>{item.Easy}</td>
                  <td>{item.Medium}</td>
                  <td>{item.Hard}</td>
                  <td>{item['Badges Acheived']}</td>
                  <td>{item['Total Submissions this year']}</td>
                  <td>{item['Active Days']}</td>
                  <td>{item['Max Streak']}</td>
                  <td>{item['Contest Ranking']}</td>
                    <td><Link to={item['Link']} target='_blank'><button>View Profile</button></Link></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ margin: '20px' }}>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous Page
          </button>
          <span style={{ margin: '10px' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next Page
          </button>
        </div>
      </div>
    </Router>
  );
}

export default Leetcode;
