import os
import sqlite3
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import Tool, initialize_agent
from langchain.memory import ConversationBufferMemory
from typing import List, Dict
import json

# Load environment variables
load_dotenv()

class ComplaintChatbot:
    def __init__(self, db_path="whatsapp_bot.db"):
        # Resolve DB path consistently: use the project root DB (one level up from this file)
        if os.path.isabs(db_path):
            self.db_path = db_path
        else:
            self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', db_path))
        
        # Initialize LLM
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=os.getenv("GEMINI_API_KEY"),
        )
        
        # Create tools
        self.complaint_tool = Tool(
            name="ComplaintQuery",
            func=self.execute_whatsapp_db_query,
            description=(
                "Query the complaint_reports table to get complaint data. "
                "MUST be used for any question about complaints, statistics, or data analysis.\n"
                "Database schema:\n"
                "Table: complaint_reports\n"
                "Columns:\n"
                "- report_id (TEXT): Unique complaint identifier\n"
                "- phone_number (TEXT): Citizen's phone number\n" 
                "- description (TEXT): Complaint description\n"
                "- category (TEXT): Complaint category (water_sanitation, traffic_transport, public_safety, waste_management, etc.)\n"
                "- priority (TEXT): Priority level (low, medium, high, very_high)\n"
                "- department (TEXT): Assigned department\n"
                "- status (TEXT): Current status (submitted, in_progress, resolved)\n"
                "- created_at (DATETIME): Submission timestamp\n"
                "- updated_at (DATETIME): Last update timestamp\n"
                "- coordinates (TEXT): Location coordinates\n"
                "- session_id (TEXT): Session identifier\n"
                "- image_path (TEXT): Path to attached image\n"
                "- resolution_days (INTEGER): Days to resolve\n"
                "\nExample queries:\n"
                "- Latest complaints: SELECT * FROM complaint_reports ORDER BY created_at DESC LIMIT 5\n"
                "- By category: SELECT * FROM complaint_reports WHERE category = 'water_sanitation'\n"
                "- High priority: SELECT * FROM complaint_reports WHERE priority IN ('high', 'very_high')\n"
                "Always use proper SQL syntax without markdown formatting."
            )
        )

    def execute_whatsapp_db_query(self, sql_query: str) -> str:
        """Execute SQL query on the WhatsApp bot database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cur = conn.cursor()
            cur.execute(sql_query)
            rows = cur.fetchall()
            
            if not rows:
                return "No data found."
            
            # Get column names
            column_names = [description[0] for description in cur.description]
            
            # Format results in a readable line-by-line format
            result_lines = []
            for i, row in enumerate(rows, 1):
                row_dict = dict(zip(column_names, row))
                
                # Format each complaint with proper structure
                complaint_lines = [f"Complaint {i}:"]
                
                # Add each field in a structured way with better formatting
                for key, value in row_dict.items():
                    if value is not None:  # Only show non-null values
                        # Format field names to be more readable
                        formatted_key = key.replace('_', ' ').title()
                        complaint_lines.append(f"  • {formatted_key}: {value}")
                
                result_lines.append("\n".join(complaint_lines))
            
            formatted_result = "\n\n".join(result_lines)
            return formatted_result
            
        except Exception as e:
            return f"SQL error: {e}"
        finally:
            if conn:
                conn.close()

    def get_chatbot_response(self, user_message: str, chat_history: List[Dict] = None) -> str:
        """Get response from the chatbot"""
        try:
            if chat_history is None:
                chat_history = []
            
            # Setup memory
            memory = ConversationBufferMemory(
                memory_key="chat_history", 
                return_messages=True
            )
            
            # Add chat history to memory
            for message in chat_history:
                if message.get('sender') == 'user':
                    memory.chat_memory.add_user_message(message.get('text', ''))
                elif message.get('sender') == 'bot':
                    memory.chat_memory.add_ai_message(message.get('text', ''))

            # Initialize agent
            agent = initialize_agent(
                tools=[self.complaint_tool],
                llm=self.llm,
                agent="conversational-react-description",
                verbose=False,  # Disable debugging for cleaner output
                memory=memory,
                handle_parsing_errors="Check your output and make sure it conforms!",
                agent_kwargs={
                    "system_message": (
                        "You are a helpful assistant for WhatsApp complaint data analysis. "
                        "You have access to a ComplaintQuery tool that MUST be used for any data queries.\n"
                        "\nCRITICAL: Always use the ComplaintQuery tool when users ask about complaints, data, or statistics. "
                        "Never try to answer data questions without first querying the database.\n"
                        "\nCommon query patterns:\n"
                        "- 'latest/recent complaints' → SELECT * FROM complaint_reports ORDER BY created_at DESC LIMIT 5\n"
                        "- 'complaints by category' → SELECT * FROM complaint_reports WHERE category = 'category_name'\n"
                        "- 'high priority' → SELECT * FROM complaint_reports WHERE priority IN ('high', 'very_high')\n"
                        "- 'total count' → SELECT COUNT(*) FROM complaint_reports\n"
                        "- 'by status' → SELECT status, COUNT(*) FROM complaint_reports GROUP BY status\n"
                        "\nThe tool automatically formats results with bullet points and line breaks. "
                        "After getting formatted data, provide helpful analysis and insights. "
                        "IMPORTANT: Use plain text only - NO markdown formatting, no **bold**, no ``` code blocks, no * bullets."
                    )
                }
            )
            
            # Get response
            response = agent.invoke({"input": user_message})
            
            if isinstance(response, dict) and 'output' in response:
                return response['output'].replace('', '').strip()
            else:
                return str(response).replace('', '').strip()
                
        except Exception as e:
            return f"Sorry, I encountered an error: {str(e)}"

    def get_database_stats(self) -> Dict:
        """Get basic database statistics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cur = conn.cursor()
            
            stats = {}
            
            # Total complaints
            cur.execute("SELECT COUNT(*) FROM complaint_reports")
            stats['total_complaints'] = cur.fetchone()[0]
            
            # Complaints by status
            cur.execute("SELECT status, COUNT(*) FROM complaint_reports GROUP BY status")
            stats['by_status'] = dict(cur.fetchall())
            
            # Complaints by priority
            cur.execute("SELECT priority, COUNT(*) FROM complaint_reports GROUP BY priority")
            stats['by_priority'] = dict(cur.fetchall())
            
            # Complaints by category
            cur.execute("SELECT category, COUNT(*) FROM complaint_reports GROUP BY category")
            stats['by_category'] = dict(cur.fetchall())
            
            # Recent complaints (last 7 days)
            cur.execute("""
                SELECT COUNT(*) FROM complaint_reports 
                WHERE created_at >= datetime('now', '-7 days')
            """)
            stats['recent_complaints'] = cur.fetchone()[0]
            
            return stats
            
        except Exception as e:
            return {"error": str(e)}
        finally:
            if conn:
                conn.close()