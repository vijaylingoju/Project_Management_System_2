import os
from bs4 import BeautifulSoup
import requests
import pandas as pd

def scrape_profile_data(profile_links, roll_no):
    scrapped_data = []

    for link, roll in zip(profile_links, roll_no):
        print(link)
        r = requests.get(link)

        if r.status_code == 200:
            data = BeautifulSoup(r.content, 'html.parser')
            res = {"Roll No": roll, "Name": "", "Rank": 0, "Total Problems Solved": 0, "Easy": 0, "Medium": 0,
                   "Hard": 0, "Badges Acheived": 0, "Total Submissions this year": 0, "Active Days": 0, "Max Streak": 0,
                   "Contest Ranking": 0, "Link": link}

            name = data.find('div', class_='text-label-1 dark:text-dark-label-1 break-all text-base font-semibold')
            res["Name"] = name.text.strip() if name else "Not available"

            rank = data.find('span', class_='ttext-label-1 dark:text-dark-label-1 font-medium')
            res["Rank"] = rank.text.strip() if rank else 0

            total = data.find('div', class_='text-[24px] font-medium text-label-1 dark:text-dark-label-1')
            res["Total Problems Solved"] = int(total.text.strip()) if total else 0

            hardness_array = data.find_all('span', class_='mr-[5px] text-base font-medium leading-[20px] text-label-1 dark:text-dark-label-1')
            d = [int(category.text.strip()) for category in hardness_array] if hardness_array else [0, 0, 0]
            res["Easy"], res["Medium"], res["Hard"] = d

            badge = data.find('div', class_='text-label-1 dark:text-dark-label-1 mt-1.5 text-2xl leading-[18px]')
            res["Badges Acheived"] = int(badge.text.strip()) if badge else 0

            sub = data.find('span', class_='lc-md:text-xl mr-[5px] text-base font-medium')
            res["Total Submissions this year"] = sub.text.strip() if sub else 0

            active = data.find_all('span', class_='font-medium text-label-2 dark:text-dark-label-2')
            d = [ele.text.strip() for ele in active[::-1]] if active else [0, 0]
            res["Max Streak"], res["Active Days"] = int(d[0]), int(d[1])

            contest_rank = data.find('div', class_='text-label-1 dark:text-dark-label-1 flex items-center text-2xl')
            res["Contest Ranking"] = contest_rank.text.strip() if contest_rank else "Not available"

            scrapped_data.append(res)
        else:
            scrapped_data.append({})

    return scrapped_data

if __name__ == "__main__":
    excel_file_path = os.path.join("C:\\MyReact\\Profile_Management_System\\back\\input_data_links.xlsx")
    df = pd.read_excel(excel_file_path)
    profile_links = df['LeetcodeProfileLink'].tolist()
    roll_no = df['Roll No'].tolist()

    scrapped_data = scrape_profile_data(profile_links, roll_no)

    result_df = pd.DataFrame(scrapped_data)
    output_excel_path = os.path.join("c:\\MyReact\\Profile_Management_System\\back", 'result_data.xlsx')

    try:
        result_df.to_excel(output_excel_path, index=False, engine='openpyxl')
        print("Done")
    except PermissionError as e:
        print(f"Error: {e}")
