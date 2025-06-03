import io
from typing import List, Dict, Any
from fpdf import FPDF
import matplotlib.pyplot as plt
import logging

logger = logging.getLogger(__name__)


class PDFReportGenerator:
    def __init__(self):
        self.pdf = FPDF()
        self.pdf.set_auto_page_break(auto=True, margin=15)

    def _add_title(self, title: str):
        self.pdf.set_font("Arial", "B", 16)
        self.pdf.cell(0, 10, title, ln=True, align="C")
        self.pdf.ln(10)

    def _add_table(
        self, title: str, columns: List[str], rows: List[List[Any]]
    ):
        self.pdf.set_font("Arial", "B", 12)
        self.pdf.cell(0, 10, title, ln=True)
        self.pdf.set_font("Arial", "", 10)
        col_width = self.pdf.w / (len(columns) + 1)
        for col in columns:
            self.pdf.cell(col_width, 8, str(col), border=1)
        self.pdf.ln()
        for row in rows:
            for item in row:
                self.pdf.cell(col_width, 8, str(item), border=1)
            self.pdf.ln()
        self.pdf.ln(5)

    def _add_chart(self, chart_img: bytes, title: str):
        self.pdf.set_font("Arial", "B", 12)
        self.pdf.cell(0, 10, title, ln=True)
        self.pdf.ln(2)
        self.pdf.image(io.BytesIO(chart_img), w=170)
        self.pdf.ln(10)

    def _generate_bar_chart(self, schemes: List[Dict[str, Any]]) -> bytes:
        fig, ax = plt.subplots(figsize=(10, 6))
        scheme_names = [s["scheme"] for s in schemes]
        total_units = [s["total_units"] for s in schemes]
        total_amount = [s["total_amount"] for s in schemes]
        ax.bar(scheme_names, total_units, label="Total Units")
        ax.bar(
            scheme_names,
            total_amount,
            bottom=total_units,
            label="Total Amount",
        )
        ax.set_ylabel("Value")
        ax.set_title("Total Units and Amount by Scheme")
        ax.legend()
        plt.xticks(rotation=45, ha="right")

        plt.subplots_adjust(bottom=0.2, left=0.1, right=0.9, top=0.9)

        buf = io.BytesIO()
        plt.savefig(buf, format="png", bbox_inches="tight", dpi=300)
        plt.close(fig)
        buf.seek(0)
        return buf.read()

    def _generate_pie_chart(self, slices: List[Dict[str, Any]]) -> bytes:
        fig, ax = plt.subplots(figsize=(8, 8))
        labels = [f"{s['user_name']} ({s['scheme']})" for s in slices]
        sizes = [s["total_units"] for s in slices]
        ax.pie(sizes, labels=labels, autopct="%1.1f%%", startangle=140)
        ax.set_title("NAV Units Distribution by User and Scheme")

        plt.subplots_adjust(left=0.1, right=0.9, top=0.9, bottom=0.1)

        buf = io.BytesIO()
        plt.savefig(buf, format="png", bbox_inches="tight", dpi=300)
        plt.close(fig)
        buf.seek(0)
        return buf.read()

    def generate_report(self, data: Dict[str, Any]) -> bytes:
        """
        data: {
            'schemes': List[{'scheme', 'total_units', 'total_amount'}],
            'slices': List[{'scheme', 'pan', 'user_name', 'total_units', 'nav_price'}],
            'details': List[{'scheme', 'users': [{'pan', 'inv_name', 'total_units', 'total_amount'}]}]
        }
        """
        logger.info("Generating PDF report")
        self.pdf.add_page()
        self._add_title("Scheme-User Investment Report")

        if data.get("schemes"):
            bar_img = self._generate_bar_chart(data["schemes"])
            self._add_chart(bar_img, "Scheme Aggregation (Bar Chart)")
            self._add_table(
                "Scheme Aggregation Table",
                ["Scheme", "Total Units", "Total Amount"],
                [
                    [s["scheme"], s["total_units"], s["total_amount"]]
                    for s in data["schemes"]
                ],
            )

        if data.get("slices"):
            pie_img = self._generate_pie_chart(data["slices"])
            self._add_chart(pie_img, "User-Scheme Distribution (Pie Chart)")
            self._add_table(
                "User-Scheme Slices Table",
                [
                    "Scheme",
                    "User Code",
                    "User Name",
                    "Total Units",
                    "NAV Price",
                ],
                [
                    [
                        s["scheme"],
                        s["pan"],
                        s["user_name"],
                        s["total_units"],
                        s["nav_price"],
                    ]
                    for s in data["slices"]
                ],
            )

        if data.get("details"):
            for scheme in data["details"]:
                self._add_table(
                    f"Users in {scheme['scheme']}",
                    ["User Code", "User Name", "Total Units", "Total Amount"],
                    [
                        [
                            u["pan"],
                            u["inv_name"],
                            u["total_units"],
                            u["total_amount"],
                        ]
                        for u in scheme["users"]
                    ],
                )

        logger.info("PDF report generated successfully")
        return self.pdf.output(dest="S")
